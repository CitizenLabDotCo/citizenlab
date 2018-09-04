module EmailCampaigns
  class Campaigns::IdeaMarkedAsSpam < Campaigns::NotificationCampaign
  	include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::IdeaMarkedAsSpam' => {'created' => true}}
    end
  end
end