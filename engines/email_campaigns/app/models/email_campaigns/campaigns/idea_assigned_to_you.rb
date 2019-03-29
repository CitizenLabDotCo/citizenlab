module EmailCampaigns
  class Campaigns::IdeaAssignedToYou < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::IdeaAssignedToYou' => {'created' => true}}
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end