module EmailCampaigns
  class Campaigns::ProjectModerationRightsReceived < Campaigns::NotificationCampaign
  	include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::ProjectModerationRightsReceived' => {'created' => true}}
    end
  end
end