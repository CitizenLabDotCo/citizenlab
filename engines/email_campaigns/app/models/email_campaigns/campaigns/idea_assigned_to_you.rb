module EmailCampaigns
  class Campaigns::IdeaAssignedToYou < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::IdeaAssignedToYou' => {'created' => true}}
    end
  end
end