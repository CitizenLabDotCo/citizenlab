module EmailCampaigns
  class Campaigns::CommentOnYourInitiative < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      CommentOnYourInitiativeMailer
    end

    def activity_triggers
      {'Notifications::CommentOnYourInitiative' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'own'
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      name_service = UserDisplayNameService.new(AppConfiguration.instance, recipient)
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: name_service.last_name!(notification.initiating_user),
          comment_author_name: name_service.display_name!(notification.comment.author),
          comment_body_multiloc: notification.comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(notification.comment, locale: recipient.locale),
          post_published_at: notification.post.published_at.iso8601,
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: name_service.display_name!(notification.post.author)
        }
      }]
    end
  end
end
