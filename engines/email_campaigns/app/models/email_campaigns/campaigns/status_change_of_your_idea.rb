module EmailCampaigns
  class Campaigns::StatusChangeOfYourIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::StatusChangeOfYourIdea' => {'created' => true}}
    end
  end
end