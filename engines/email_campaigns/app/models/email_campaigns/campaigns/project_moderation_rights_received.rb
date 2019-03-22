module EmailCampaigns
  class Campaigns::ProjectModerationRightsReceived < Campaigns::NotificationCampaign
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::ProjectModerationRightsReceived' => {'created' => true}}
    end
  end
end