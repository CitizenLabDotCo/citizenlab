module EmailCampaigns
  class Campaigns::AdminRightsReceived < Campaigns::NotificationCampaign
  	include Disableable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::AdminRightsReceived' => {'created' => true}}
    end
  end
end