module EmailCampaigns
  class Campaigns::CommentDeletedByAdmin < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::CommentDeletedByAdmin' => {'created' => true}}
    end
  end
end