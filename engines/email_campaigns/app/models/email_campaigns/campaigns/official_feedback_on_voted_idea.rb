module EmailCampaigns
  class Campaigns::OfficialFeedbackOnVotedIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable
    include LifecycleStageRestrictable
    allow_lifecycle_stages only: ['active']

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnVotedIdea' => {'created' => true}}
    end
  end
end