module EmailCampaigns
  class Campaigns::InitiativeMarkedAsSpam < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin']
    end

    def mailer_class
      InitiativeMarkedAsSpamMailer
    end

    def activity_triggers
      {'Notifications::InitiativeMarkedAsSpam' => {'created' => true}}
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
          post_created_at: notification.post.created_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
          initiative_votes_needed: notification.post.votes_needed,
          initiative_expires_at: notification.post.expires_at.iso8601,
          spam_report_reason_code: notification.spam_report.reason_code,
          spam_report_other_reason: notification.spam_report.other_reason
        }
      }]
    end
  end
end
