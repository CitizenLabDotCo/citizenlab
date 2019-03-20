module EmailCampaigns
  class Campaigns::OfficialFeedbackOnVotedIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnVotedIdea' => {'created' => true}}
    end
  end
end