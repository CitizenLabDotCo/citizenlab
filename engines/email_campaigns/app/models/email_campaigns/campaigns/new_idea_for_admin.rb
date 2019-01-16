module EmailCampaigns
  class Campaigns::NewIdeaForAdmin < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable
    include Disableable
    include Trackable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::NewIdeaForAdmin' => {'created' => true}}
    end
  end
end