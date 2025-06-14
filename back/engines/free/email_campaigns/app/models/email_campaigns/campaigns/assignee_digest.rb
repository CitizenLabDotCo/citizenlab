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
  class Campaigns::AssigneeDigest < Campaign
    include Disableable
    include Consentable
    include Schedulable
    include RecipientConfigurable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :user_filter_admins_moderators_only

    N_TOP_IDEAS = 12

    def self.default_schedule
      start_time = AppConfiguration.timezone.local(2019)

      IceCube::Schedule.new(start_time) do |s|
        s.add_recurrence_rule(
          IceCube::Rule.weekly(1).day(:tuesday).hour_of_day(8)
        )
      end
    end

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.admins_and_managers'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.admins_and_managers_assigned_to_the_input'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.inputs'
    end

    def mailer_class
      AssigneeDigestMailer
    end

    def generate_commands(recipient:, time: nil)
      time ||= Time.now
      assigned = {
        assigned_inputs: assigned_inputs(recipient: recipient, time: time),
        succesful_assigned_inputs: succesful_assigned_inputs(recipient: recipient, time: time)
      }
      tracked_content = {
        idea_ids: (assigned[:assigned_inputs] + assigned[:succesful_assigned_inputs]).pluck(:id).compact
      }
      if assigned.values.any?(&:present?)
        [{
          event_payload: {
            **assigned,
            need_feedback_assigned_inputs_count: StatIdeaPolicy::Scope.new(recipient, Idea.published).resolve.where(assignee: recipient).feedback_needed.count
          },
          tracked_content: tracked_content
        }]
      else
        []
      end
    end

    private

    def user_filter_admins_moderators_only(users_scope, _options = {})
      users_scope.admin.or(users_scope.project_moderator)
    end

    def assigned_inputs(recipient:, time:)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_ideas
        .feedback_needed
        .order(published_at: :desc)
        .take(N_TOP_IDEAS)
        .map do |idea|
          {
            id: idea.id,
            title_multiloc: idea.title_multiloc,
            url: Frontend::UrlService.new.model_to_url(idea),
            published_at: idea.published_at&.iso8601,
            assigned_at: idea.assigned_at&.iso8601,
            author_name: name_service.display_name!(idea.author),
            likes_count: idea.likes_count,
            dislikes_count: idea.dislikes_count,
            comments_count: idea.comments_count
          }
        end
    end

    def succesful_assigned_inputs(recipient:, time:)
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      recipient.assigned_ideas
        .feedback_needed
        .published
        .with_status_code('threshold_reached')
        .with_status_transitioned_after(time - 1.week)
        .order(likes_count: :desc)
        .map do |idea|
        {
          id: idea.id,
          title_multiloc: idea.title_multiloc,
          url: Frontend::UrlService.new.model_to_url(idea),
          published_at: idea.published_at&.iso8601,
          assigned_at: idea.assigned_at&.iso8601,
          author_name: name_service.display_name!(idea.author),
          likes_count: idea.likes_count,
          dislikes_count: idea.dislikes_count,
          comments_count: idea.comments_count
        }
      end
    end
  end
end
