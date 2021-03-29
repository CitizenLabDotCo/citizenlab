module EmailCampaigns
  class Campaigns::CommentDeletedByAdmin < Campaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      CommentDeletedByAdminMailer
    end

    def activity_triggers
      {'Notifications::CommentDeletedByAdmin' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          comment_created_at: notification.comment.created_at.iso8601,
          comment_body_multiloc: notification.comment.body_multiloc,
          reason_code: notification.reason_code,
          other_reason: notification.other_reason,
          post_type: notification.post_type,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale)
        }
      }]
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end
