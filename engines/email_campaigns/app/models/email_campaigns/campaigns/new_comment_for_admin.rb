module EmailCampaigns
  class Campaigns::NewCommentForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::NewCommentForAdmin' => {'created' => true}}
    end

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          initiating_user_first_name: notification.initiating_user&.first_name,
          initiating_user_last_name: notification.initiating_user&.last_name,                    
          post_published_at: notification.post.published_at.iso8601,   
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: notification.post.author_name,
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