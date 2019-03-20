module EmailCampaigns
  class Campaigns::NewIdeaForAdmin < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::NewIdeaForAdmin' => {'created' => true}}
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end