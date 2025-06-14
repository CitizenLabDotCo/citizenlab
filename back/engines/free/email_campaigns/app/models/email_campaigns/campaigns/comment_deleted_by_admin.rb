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
  class Campaigns::CommentDeletedByAdmin < Campaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: %w[trial active]

    recipient_filter :filter_notification_recipient

    def mailer_class
      CommentDeletedByAdminMailer
    end

    def activity_triggers
      { 'Notifications::CommentDeletedByAdmin' => { 'created' => true } }
    end

    def filter_notification_recipient(users_scope, activity:, time: nil)
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands(recipient:, activity:, time: nil)
      notification = activity.item
      [{
        event_payload: {
          comment_created_at: notification.comment.created_at.iso8601,
          comment_body_multiloc: notification.comment.body_multiloc,
          reason_code: notification.reason_code,
          other_reason: notification.other_reason,
          idea_url: Frontend::UrlService.new.model_to_url(notification.idea, locale: Locale.new(recipient.locale))
        }
      }]
    end

    def self.recipient_role_multiloc_key
      'email_campaigns.admin_labels.recipient_role.registered_users'
    end

    def self.recipient_segment_multiloc_key
      'email_campaigns.admin_labels.recipient_segment.user_who_commented'
    end

    def self.content_type_multiloc_key
      'email_campaigns.admin_labels.content_type.comments'
    end

    def self.trigger_multiloc_key
      'email_campaigns.admin_labels.trigger.comment_is_deleted'
    end

    protected

    def set_enabled
      self.enabled = false if enabled.nil?
    end
  end
end
