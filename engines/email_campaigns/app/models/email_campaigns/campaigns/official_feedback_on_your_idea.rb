module EmailCampaigns
  class Campaigns::OfficialFeedbackOnYourIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnYourIdea' => {'created' => true}}
    end
  end
end