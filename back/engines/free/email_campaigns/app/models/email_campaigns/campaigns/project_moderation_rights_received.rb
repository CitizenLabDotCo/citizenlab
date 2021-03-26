module EmailCampaigns
  class Campaigns::ProjectModerationRightsReceived < Campaign
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['trial','active']

    recipient_filter :filter_notification_recipient

    def mailer_class
      ProjectModerationRightsReceivedMailer
    end

    def activity_triggers
      {'Notifications::ProjectModerationRightsReceived' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          project_id: notification.project.id,
          project_title_multiloc: notification.project.title_multiloc,
          project_ideas_count: notification.project.ideas_count,
          project_url: Frontend::UrlService.new.model_to_url(notification.project, locale: recipient.locale)
        }
      }]
    end
  end
end
