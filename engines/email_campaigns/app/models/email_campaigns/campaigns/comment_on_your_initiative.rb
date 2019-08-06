module EmailCampaigns
  class Campaigns::CommentOnYourInitiative < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include LifecycleStageRestrictable
    include Trackable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::CommentOnYourInitiative' => {'created' => true}}
    end
  end
end