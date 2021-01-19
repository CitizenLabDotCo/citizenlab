module EmailCampaigns
  class Campaigns::ThresholdReachedForAdmin < Campaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      ThresholdReachedForAdminMailer
    end

    def self.consentable_roles
      ['admin']
    end

    def activity_triggers
      {'Notifications::ThresholdReachedForAdmin' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def self.category
      'admin'
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      assignee_attributes = {}
      if notification.post.assignee_id
        assignee_attributes[:assignee_first_name] = notification.post.assignee.first_name
        assignee_attributes[:assignee_last_name] = notification.post.assignee.last_name
      end
      [{
        event_payload: {
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_published_at: notification.post.published_at.iso8601,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
          post_upvotes_count: notification.post.upvotes_count,
          post_comments_count: notification.post.comments_count,
          post_images: notification.post.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_header_bg: {
            versions: notification.post.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          **assignee_attributes
        }
      }]
    end

    protected

    def set_enabled
      self.enabled = true if self.enabled.nil?
    end
  end
end
