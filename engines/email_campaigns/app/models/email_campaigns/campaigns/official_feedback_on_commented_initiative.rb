module EmailCampaigns
  class Campaigns::OfficialFeedbackOnCommentedInitiative < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnCommentedInitiative' => {'created' => true}}
    end
  end
end