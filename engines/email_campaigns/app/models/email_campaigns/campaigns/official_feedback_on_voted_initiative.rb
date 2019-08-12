module EmailCampaigns
  class Campaigns::OfficialFeedbackOnVotedInitiative < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnVotedInitiative' => {'created' => true}}
    end
  end
end