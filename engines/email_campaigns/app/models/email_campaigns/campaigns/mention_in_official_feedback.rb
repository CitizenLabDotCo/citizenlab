module EmailCampaigns
  class Campaigns::MentionInOfficialFeedback < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::MentionInOfficialFeedback' => {'created' => true}}
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end