module EmailCampaigns
  class Campaigns::ProjectPhaseStarted < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::ProjectPhaseStarted' => {'created' => true}}
    end
  end
end