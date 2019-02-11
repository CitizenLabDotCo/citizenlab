module EmailCampaigns
  class Campaigns::NewCommentForAdmin < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::NewCommentForAdmin' => {'created' => true}}
    end
  end
end