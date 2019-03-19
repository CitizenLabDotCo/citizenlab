module EmailCampaigns
  class Campaigns::MentionInOfficialFeedback < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::MentionInOfficialFeedback' => {'created' => true}}
    end
  end
end