module EmailCampaigns
  class Campaigns::MentionInComment < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::MentionInComment' => {'created' => true}}
    end
  end
end