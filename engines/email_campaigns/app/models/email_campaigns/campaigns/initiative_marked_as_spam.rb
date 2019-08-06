module EmailCampaigns
  class Campaigns::InitiativeMarkedAsSpam < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin']
    end

    def activity_triggers
      {'Notifications::InitiativeMarkedAsSpam' => {'created' => true}}
    end
  end
end