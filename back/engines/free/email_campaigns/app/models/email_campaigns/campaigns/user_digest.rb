# frozen_string_literal: true

# == Schema Information
#
# Table name: email_campaigns_campaigns
#
#  id                   :uuid             not null, primary key
#  type                 :string           not null
#  author_id            :uuid
#  enabled              :boolean
#  sender               :string
#  reply_to             :string
#  schedule             :jsonb
#  subject_multiloc     :jsonb
#  body_multiloc        :jsonb
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  deliveries_count     :integer          default(0), not null
#  context_id           :uuid
#  title_multiloc       :jsonb
#  intro_multiloc       :jsonb
#  button_text_multiloc :jsonb
#
# Indexes
#
#  index_email_campaigns_campaigns_on_author_id   (author_id)
#  index_email_campaigns_campaigns_on_context_id  (context_id)
#  index_email_campaigns_campaigns_on_type        (type)
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
      start_time = AppConfiguration.timezone.local(2020)

      IceCube::Schedule.new(start_time) do |s|
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

      @users_to_projects ||= users_to_projects
      discover_projects = discover_projects @users_to_projects[recipient.id]

      @notifications_counts ||= notifications_counts
      @top_ideas ||= top_ideas(time)
      @successful_proposals ||= successful_proposals(time)

      [{
        event_payload: {
          notifications_count: @notifications_counts[recipient.id],
          top_ideas: @top_ideas.map do |idea|
            idea_payload(idea, recipient)
          end,
          discover_projects: discover_projects.map do |project|
            discover_projects_payload project, recipient
          end,
          successful_proposals: @successful_proposals.map do |idea|
            proposal_payload(idea, recipient)
          end
        },
        tracked_content: {
          idea_ids: (@top_ideas.map(&:id) + @successful_proposals.map(&:id)).uniq,
          project_ids: discover_projects.map(&:id)
        }
      }]
    end

    # @return [Boolean]
    def content_worth_sending?(time:, activity: nil)
      # Check positive? as fetching a non-integer env var would result in zero and this hook would return true,
      # whilst top_ideas would be limited to zero ideas, possibly resulting in no content being sent.
      @content_worth_sending ||=
        (recent_ideas(time).size >= N_TOP_IDEAS && N_TOP_IDEAS.positive?) ||
        successful_proposals(time).any?
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

    def top_ideas(time)
      recent_ideas(time).limit N_TOP_IDEAS
    end

    def recent_ideas(time)
      ti_service = TrendingIdeaService.new

      ideas = IdeaPolicy::Scope.new(nil, Idea).resolve
        .published
        .includes(:comments)
        .activity_after(time - 1.week)

      input_ideas = IdeasFinder.new({}, scope: ideas).find_records
      ti_service.sort_trending input_ideas
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

    def idea_payload(idea, recipient)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      {
        title_multiloc: idea.title_multiloc,
        body_multiloc: idea.body_multiloc,
        author_name: name_service.display_name!(idea.author),
        likes_count: idea.likes_count,
        dislikes_count: idea.dislikes_count,
        comments_count: idea.comments_count,
        published_at: idea.published_at&.iso8601,
        url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
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

    def proposal_payload(proposal, recipient)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      {
        id: proposal.id,
        title_multiloc: proposal.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(proposal, locale: Locale.new(recipient.locale)),
        published_at: proposal.published_at&.iso8601,
        author_name: name_service.display_name!(proposal.author),
        likes_count: proposal.likes_count,
        dislikes_count: nil, # needed in object as template is shared with ideas
        comments_count: proposal.comments_count
      }
    end

    def top_comment_payload(comment, name_service)
      {
        body_multiloc: comment.body_multiloc,
        created_at: comment.created_at.iso8601,
        author_first_name: comment.author&.first_name,
        author_last_name: name_service.last_name!(comment.author),
        author_locale: comment.author&.locale,
        author_avatar: comment.author.avatar&.versions&.to_h { |k, v| [k.to_s, v.url] }
      }
    end

    def discover_projects_payload(project, recipient)
      {
        title_multiloc: project.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(project, locale: Locale.new(recipient.locale)),
        created_at: project.created_at.iso8601
      }
    end

    def successful_proposals(time)
      @successful_proposals ||= IdeaPolicy::Scope.new(nil, Idea).resolve
        .published
        .with_status_code('threshold_reached')
        .with_status_transitioned_after(time - 1.week)
        .includes(:idea_images)
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end
  end
end
