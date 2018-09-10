module EmailCampaigns
  class Campaigns::StatusChangeOfYourIdea < Campaigns::NotificationCampaign
  	include Disableable
    # include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::StatusChangeOfYourIdea' => {'created' => true}}
    end
  end
end