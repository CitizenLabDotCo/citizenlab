module EmailCampaigns
  class Campaigns::MentionInOfficialFeedback < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      MentionInOfficialFeedbackMailer
    end

    def activity_triggers
      {'Notifications::MentionInOfficialFeedback' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'mention'
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          post_published_at: notification.post.published_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: name_service.display_name!(notification.post.author),
          post_type: notification.post_type,
          official_feedback_author_multiloc: notification.official_feedback.author_multiloc,
          official_feedback_body_multiloc: notification.official_feedback.body_multiloc,
          official_feedback_url: Frontend::UrlService.new.model_to_url(notification.official_feedback, locale: recipient.locale)
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end
