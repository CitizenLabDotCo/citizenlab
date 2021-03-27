module EmailCampaigns
  class Campaigns::AdminRightsReceived < Campaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages except: ['trial', 'churned']

    recipient_filter :filter_notification_recipient

    def mailer_class
      AdminRightsReceivedMailer
    end

    def activity_triggers
      {'Notifications::AdminRightsReceived' => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:, time: nil
      notification = activity.item
      [{
        event_payload: {
          
        }
      }]
    end
  end
end