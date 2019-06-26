module EmailCampaigns
  class Campaigns::AdminRightsReceived < Campaigns::NotificationCampaign
    include ActivityTriggerable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages except: ['churned']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::AdminRightsReceived' => {'created' => true}}
    end
  end
end