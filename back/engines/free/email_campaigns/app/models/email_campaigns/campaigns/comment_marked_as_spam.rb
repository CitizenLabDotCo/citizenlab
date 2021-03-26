module EmailCampaigns
  class Campaigns::CommentMarkedAsSpam < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def mailer_class
      CommentMarkedAsSpamMailer
    end

    def activity_triggers
      {'Notifications::CommentMarkedAsSpam' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'admin'
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: notification.initiating_user&.last_name,
          post_title_multiloc: notification.post.title_multiloc,
          post_type: notification.post_type,
          comment_author_name: notification.comment.author_name,
          comment_body_multiloc: notification.comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(notification.comment, locale: recipient.locale),
          spam_report_reason_code: notification.spam_report.reason_code,
          spam_report_other_reason: notification.spam_report.other_reason
        }
      }]
    end
  end
end
