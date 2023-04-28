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
  class Campaigns::IdeaMarkedAsSpam < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      %w[admin project_moderator]
    end

    def mailer_class
      IdeaMarkedAsSpamMailer
    end

    def activity_triggers
      { 'Notifications::IdeaMarkedAsSpam' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'admin'
    end

    def self.recipient_role_label
      I18n.t('email_campaigns.admin_labels.recipient_role.admins_and_moderators')
    end

    def self.recipient_segment_label
      I18n.t('email_campaigns.admin_labels.recipient_segment.admins')
    end

    def self.content_type_label
      I18n.t('email_campaigns.admin_labels.content_type.ideas')
    end

    def self.trigger_label
      I18n.t('email_campaigns.admin_labels.trigger.idea_is_flagged_as_spam')
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: notification.initiating_user&.last_name,
          post_created_at: notification.post.created_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
          spam_report_reason_code: notification.spam_report.reason_code,
          spam_report_other_reason: notification.spam_report.other_reason
        }
      }]
    end
  end
end
