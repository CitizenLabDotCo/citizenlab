# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id               :uuid             not null, primary key
#  type             :string           not null
#  author_id        :uuid
#  enabled          :boolean
#  sender           :string
#  reply_to         :string
#  schedule         :jsonb
#  subject_multiloc :jsonb
#  body_multiloc    :jsonb
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  deliveries_count :integer          default(0), not null
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id  (author_id)
#  index_email_campaigns_campaigns_on_type       (type)
#
# Foreign Keys
#
#  fk_rails_...  (author_id => users.id)
#
module EmailCampaigns
  class Campaigns::UserDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_no_invitees

    before_send :content_worth_sending?

    N_TOP_IDEAS = 3
    N_TOP_COMMENTS = 2
    N_DISCOVER_PROJECTS = 3

    def self.default_schedule
      day, hour = [[:thursday, 13], [:saturday, 8]].sample
      IceCube::Schedule.new(Time.find_zone(AppConfiguration.instance.settings('core', 'timezone')).local(2020)) do |s|
        rule = IceCube::Rule.weekly(1).day(day).hour_of_day(hour)
        s.add_recurrence_rule(rule)
      end
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.all_users'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def mailer_class
      UserDigestMailer
    end

    def generate_commands(recipient:, time: nil)
      time ||= Time.now
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)

      @users_to_projects ||= users_to_projects
      discover_projects = discover_projects @users_to_projects[recipient.id]

      @notifications_counts ||= notifications_counts
      @top_ideas ||= top_ideas
      @new_initiatives ||= new_initiatives(name_service, time: time)
      @successful_initiatives ||= successful_initiatives(name_service, time: time)
      @initiative_ids ||= (@new_initiatives + @successful_initiatives).pluck(:id).compact

      [{
        event_payload: {
          notifications_count: @notifications_counts[recipient.id],
          top_ideas: @top_ideas.map do |idea|
            top_idea_payload idea, recipient
          end,
          discover_projects: discover_projects.map do |project|
            discover_projects_payload project, recipient
          end,
          new_initiatives: @new_initiatives,
          successful_initiatives: @successful_initiatives
        },
        tracked_content: {
          idea_ids: @top_ideas.map(&:id),
          initiative_ids: @initiative_ids,
          project_ids: discover_projects.map(&:id)
        }
      }]
    end

    # @return [Boolean]
    def content_worth_sending?(_)
      # Check positive? as fetching a non-integer env var would result in zero and this hook would return true,
      # whilst top_ideas would be limited to zero ideas, possibly resulting in no content being sent.
      @content_worth_sending ||= trending_ideas.size >= N_TOP_IDEAS && N_TOP_IDEAS.positive?
    end

    private

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def notifications_counts
      User.includes(:unread_notifications).to_h do |u|
        [u.id, u.unread_notifications.size]
      end
    end

    def top_ideas
      trending_ideas.limit N_TOP_IDEAS
    end

    def trending_ideas
      ti_service = TrendingIdeaService.new

      ideas = IdeaPolicy::Scope.new(nil, Idea).resolve
        .published
        .includes(:comments)

      input_ideas = IdeasFinder.new({}, scope: ideas).find_records
      trending_ids = ti_service.filter_trending(input_ideas).ids
      ti_service.sort_trending ideas.where(id: trending_ids)
    end

    def users_to_projects
      res = {}
      Project.left_outer_joins(:admin_publication)
        .where(admin_publications: { publication_status: 'published' })
        .map do |project|
        ProjectPolicy::InverseScope.new(project, User).resolve.ids.each do |user_id|
          res[user_id] ||= []
          res[user_id] += [project]
        end
      end
      res.each(&:uniq!)
      res
    end

    def discover_projects(projects)
      projects.sort_by(&:created_at).reverse.take(N_DISCOVER_PROJECTS)
    end

    def top_idea_payload(idea, recipient)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      {
        title_multiloc: idea.title_multiloc,
        body_multiloc: idea.body_multiloc,
        author_name: name_service.display_name!(idea.author),
        likes_count: idea.likes_count,
        dislikes_count: idea.dislikes_count,
        comments_count: idea.comments_count,
        published_at: idea.published_at&.iso8601,
        url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
        idea_images: idea.idea_images.map do |image|
          {
            ordering: image.ordering,
            versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
          }
        end,
        top_comments: idea.comments
          .select(&:published?)
          .sort_by { |c| -c.children.size }
          .take(N_TOP_COMMENTS).map do |comment|
            top_comment_payload comment, name_service
          end
      }
    end

    def top_comment_payload(comment, name_service)
      {
        body_multiloc: comment.body_multiloc,
        created_at: comment.created_at.iso8601,
        author_first_name: comment.author&.first_name,
        author_last_name: name_service.last_name!(comment.author),
        author_locale: comment.author&.locale,
        author_avatar: comment.author.avatar&.versions&.map { |k, v| [k.to_s, v.url] }&.to_h
      }
    end

    def discover_projects_payload(project, recipient)
      {
        title_multiloc: project.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(project, locale: recipient.locale),
        created_at: project.created_at.iso8601
      }
    end

    def new_initiatives(name_service, time:)
      InitiativePolicy::Scope.new(nil, Initiative).resolve
        .published
        .proposed_after(1.week.ago)
        .includes(:initiative_images)
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: name_service.display_name!(initiative.author),
          likes_count: initiative.likes_count,
          comments_count: initiative.comments_count,
          images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          header_bg: {
            versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
          }
        }
      end
    end

    def successful_initiatives(name_service, time:)
      InitiativePolicy::Scope.new(nil, Initiative).resolve
        .published
        .left_outer_joins(:initiative_status_changes, :initiative_images)
        .where(
          'initiative_status_changes.initiative_status_id = ? AND initiative_status_changes.created_at > ?',
          InitiativeStatus.where(code: 'threshold_reached').ids.first,
          (time - 1.week)
        )
        .feedback_needed
        .map do |initiative|
        {
          id: initiative.id,
          title_multiloc: initiative.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(initiative),
          published_at: initiative.published_at.iso8601,
          author_name: name_service.display_name!(initiative.author),
          likes_count: initiative.likes_count,
          comments_count: initiative.comments_count,
          threshold_reached_at: initiative.threshold_reached_at.iso8601,
          images: initiative.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          header_bg: {
            versions: initiative.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
          }
        }
      end
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end
  end
end
