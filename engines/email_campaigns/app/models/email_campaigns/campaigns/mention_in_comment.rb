module EmailCampaigns
  class Campaigns::MentionInComment < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::MentionInComment' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'mention'
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      name_service = UserDisplayNameService(Tenant.current, recipient)
      initiating_user_last_name = name_service.last_name(notification.initiating_user) if comment.author.present?
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: initiating_user_last_name,
          post_published_at: notification.post.published_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_author_name: name_serice.display_name(notification.post.author),
          post_type: notification.post_type,
          comment_body_multiloc: notification.comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(notification.comment, locale: recipient.locale)
        }
      }]
    end
  end
end
