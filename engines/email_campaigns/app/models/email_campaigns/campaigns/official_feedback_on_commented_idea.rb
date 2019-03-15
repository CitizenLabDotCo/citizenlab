module EmailCampaigns
  class Campaigns::OfficialFeedbackOnCommentedIdea < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::OfficialFeedbackOnCommentedIdea' => {'created' => true}}
    end
  end
end