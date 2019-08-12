module EmailCampaigns
  class Campaigns::InitiativeAssignedToYou < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin']
    end

    def activity_triggers
      {'Notifications::InitiativeAssignedToYou' => {'created' => true}}
    end
  end
end