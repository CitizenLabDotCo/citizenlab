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
  class Campaigns::VotingPhaseStarted < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      VotingPhaseStartedMailer
    end

    def activity_triggers
      { 'Notifications::ProjectPhaseStarted' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.users_who_engaged_with_the_project'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.projects'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.project_phase_changes'
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      if notification.phase.voting?
        [{
          event_payload: {
            project_url: Frontend::UrlService.new.model_to_url(notification.phase.project, locale: Locale.new(recipient.locale)),
            project_title_multiloc: notification.phase.project.title_multiloc,
            phase_title_multiloc: notification.phase.title_multiloc,
            ideas: EmailCampaigns::PayloadFormatterService.new.format_ideas_list(notification.phase.ideas, recipient)
          },
          delay: 8.hours.to_i
        }]
      else
        []
      end
    end
  end
end
