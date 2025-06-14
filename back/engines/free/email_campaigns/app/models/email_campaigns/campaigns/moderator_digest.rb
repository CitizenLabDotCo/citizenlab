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
#  custom_text_multiloc :jsonb
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
  class Campaigns::ModeratorDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_moderator_only
    recipient_filter :user_filter_no_invitees

    before_send :content_worth_sending?

    N_TOP_IDEAS = 12

    def mailer_class
      ModeratorDigestMailer
    end

    def self.default_schedule
      start_time = AppConfiguration.timezone.local(2019)

      IceCube::Schedule.new(start_time) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def self.consentable_roles
      ['project_moderator']
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.managers'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def generate_commands(recipient:, time: nil)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.moderatable_project_ids.filter_map do |project_id|
        project = Project.find_by(id: project_id)
        next unless project

        statistics = statistics project
        next if project.admin_publication.archived? || zero_statistics?(statistics)

        project_title = project.title_multiloc[recipient.locale] || project.title_multiloc[I18n.default_locale]
        top_ideas = top_ideas(project, name_service)
        successful_proposals = successful_proposals(project, name_service)
        idea_ids = (top_ideas.pluck(:id) + successful_proposals.pluck(:id)).uniq
        {
          event_payload: {
            project_id: project.id,
            project_title: project_title,
            statistics:,
            top_ideas:,
            has_new_ideas: top_ideas.any?,
            successful_proposals:
          },
          tracked_content: {
            idea_ids: idea_ids
          }
        }
      end
    end

    private

    def user_filter_moderator_only(users_scope, _options = {})
      users_scope.where("roles @> '[{\"type\":\"project_moderator\"}]'")
    end

    def user_filter_no_invitees(users_scope, _options = {})
      users_scope.active
    end

    def content_worth_sending?(_)
      # TODO: figure out which moderator and project we're talking about
      true
    end

    def statistics(project)
      ps = ParticipantsService.new
      participants_increase = ps.projects_participants([project], since: (Time.now - days_ago)).size
      ideas = Idea.published.where(project_id: project.id).load
      comments = Comment.where(idea_id: ideas.map(&:id))
      {
        new_ideas_increase: stat_increase(ideas.filter_map(&:published_at)),
        new_comments_increase: stat_increase(comments.filter_map(&:created_at)),
        new_participants_increase: participants_increase
      }
    end

    def zero_statistics?(statistics)
      (statistics[:new_ideas_increase] == 0) &&
        (statistics[:new_comments_increase] == 0) &&
        (statistics[:new_participants_increase] == 0)
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end

    def stat_increase(stat_dates = [])
      stat_dates.count { |t| t > (Time.now - days_ago) }
    end

    def top_ideas(project, name_service)
      # take N_TOP_IDEAS
      top_ideas = Idea.published.where project_id: project.id
      top_ideas = top_ideas.all.select do |idea|
        idea.participation_method_on_creation.supports_public_visibility? &&
          (idea_activity_count(idea) > 0 || idea.published_at > Time.now - days_ago)
      end
      top_ideas = top_ideas.sort_by do |idea|
        idea_activity_count idea
      end.reverse.take N_TOP_IDEAS
      # payload
      top_ideas.map do |idea|
        new_reactions = idea.reactions.where('created_at > ?', Time.now - days_ago)
        {
          id: idea.id,
          title_multiloc: idea.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(idea),
          published_at: idea.published_at.iso8601,
          author_name: name_service.display_name!(idea.author),
          likes_count: idea.likes_count,
          likes_increment: new_reactions.where(mode: 'up').count,
          dislikes_count: idea.dislikes_count,
          dislikes_increment: new_reactions.where(mode: 'down').count,
          comments_count: idea.comments_count,
          comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
        }
      end
    end

    def idea_activity_count(idea)
      new_reactions_count = idea.reactions.where('created_at > ?', Time.now - days_ago).count
      new_comments_increase = idea.comments.where('created_at > ?', Time.now - days_ago).count
      new_reactions_count + new_comments_increase
    end

    def successful_proposals(project, name_service)
      @successful_proposals ||= Idea
        .where(project_id: project.id)
        .published
        .with_status_code('threshold_reached')
        .with_status_transitioned_after(Time.now - days_ago)
        .map { |idea| serialize_proposal(idea, name_service) }
    end

    def serialize_proposal(idea, name_service)
      {
        id: idea.id,
        title_multiloc: idea.title_multiloc,
        url: Frontend::UrlService.new.model_to_url(idea),
        published_at: idea.published_at.iso8601,
        author_name: name_service.display_name!(idea.author),
        likes_count: idea.likes_count,
        comments_count: idea.comments_count
      }
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
