module EmailCampaigns
  class Campaigns::CommentMarkedAsSpam < Campaigns::NotificationCampaign
  	include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {'Notifications::CommentMarkedAsSpam' => {'created' => true}}
    end
  end
end