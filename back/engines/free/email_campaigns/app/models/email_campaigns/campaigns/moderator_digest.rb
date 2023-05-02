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
      IceCube::Schedule.new(Time.find_zone(AppConfiguration.instance.settings('core', 'timezone')).local(2019)) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:monday).hour_of_day(10)
        )
      end
    end

    def self.consentable_roles
      ['project_moderator']
    end

    def self.category
      'admin'
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.managers'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.general'
    end

    def self.trigger_multiloc_key
      'scheduled'
    end

    def generate_commands(recipient:, time: nil)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.moderatable_project_ids.filter_map do |project_id|
        project = Project.find_by(id: project_id)
        next unless project

        statistics = statistics project
        next unless nonzero_statistics? statistics

        project_name = project.title_multiloc[recipient.locale] || project.title_multiloc[I18n.default_locale]
        top_ideas = top_ideas project, name_service
        idea_ids = top_ideas.pluck(:id)
        {
          event_payload: {
            project_id: project.id,
            project_name: project_name,
            statistics: statistics,
            top_ideas: top_ideas,
            has_new_ideas: top_ideas.any?
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
      participants_past_increase = ps.projects_participants([project], since: (Time.now - (days_ago * 2))).size - participants_increase
      ideas = Idea.published.where(project_id: project.id).load
      comments = Comment.where(post_id: ideas.map(&:id))
      votes = Vote.where(votable_id: (ideas.map(&:id) + comments.map(&:id)))
      {
        activities: {
          new_ideas: stat_increase(
            ideas.filter_map(&:published_at)
          ),
          new_votes: stat_increase(
            votes.filter_map(&:created_at)
          ),
          new_comments: stat_increase(
            comments.filter_map(&:created_at)
          ),
          total_ideas: ideas.size
        },
        users: {
          new_visitors: stat_increase(
            []
          ),
          new_participants: {
            increase: participants_increase,
            past_increase: participants_past_increase
          },
          total_participants: ps.project_participants(project).size
        }
      }
    end

    def nonzero_statistics?(statistics)
      !((statistics.dig(:activities, :new_ideas, :increase) == 0) &&
         (statistics.dig(:activities, :new_comments, :increase) == 0) &&
         (statistics.dig(:users, :new_visitors, :increase) == 0) &&
         (statistics.dig(:users, :new_users, :increase) == 0) &&
         (statistics.dig(:users, :active_users, :increase) == 0)
       )
    end

    def days_ago
      t1, t2 = ic_schedule.first 2
      t2 ||= t1 + 7.days
      ((t2 - t1) / 1.day).days
    end

    def stat_increase(ts)
      second_last_agos = ts.select { |t| t > (Time.now - (days_ago * 2)) }
      last_agos = second_last_agos.select { |t| t > (Time.now - days_ago) }
      {
        increase: last_agos.size,
        past_increase: second_last_agos.size
      }
    end

    # @param [UserDisplayNameService] name_service
    def top_ideas(project, name_service)
      # take N_TOP_IDEAS
      top_ideas = Idea.published.where project_id: project.id
      top_ideas = top_ideas.all.select do |idea|
        idea.participation_method_on_creation.include_data_in_email? &&
          (idea_activity_count(idea) > 0 || idea.published_at > Time.now - days_ago)
      end
      top_ideas = top_ideas.sort_by do |idea|
        idea_activity_count idea
      end.reverse.take N_TOP_IDEAS
      # payload
      top_ideas.map do |idea|
        new_votes = idea.votes.where('created_at > ?', Time.now - days_ago)
        {
          id: idea.id,
          title_multiloc: idea.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(idea),
          published_at: idea.published_at.iso8601,
          author_name: name_service.display_name!(idea.author),
          upvotes_count: idea.upvotes_count,
          upvotes_increment: new_votes.where(mode: 'up').count,
          downvotes_count: idea.downvotes_count,
          downvotes_increment: new_votes.where(mode: 'down').count,
          comments_count: idea.comments_count,
          comments_increment: idea.comments.where('created_at > ?', Time.now - days_ago).count
        }
      end
    end

    def idea_activity_count(idea)
      new_vote_count = idea.votes.where('created_at > ?', Time.now - days_ago).count
      new_comments_count = idea.comments.where('created_at > ?', Time.now - days_ago).count
      new_vote_count + new_comments_count
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
