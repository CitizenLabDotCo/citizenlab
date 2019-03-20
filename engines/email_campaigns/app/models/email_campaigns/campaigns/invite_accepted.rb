module EmailCampaigns
  class Campaigns::InviteAccepted < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient


    def self.consentable_roles
      ['admin']
    end

    def activity_triggers
      {'Notifications::InviteAccepted' => {'created' => true}}
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end