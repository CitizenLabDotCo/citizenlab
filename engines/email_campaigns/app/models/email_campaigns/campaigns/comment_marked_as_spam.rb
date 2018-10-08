module EmailCampaigns
  class Campaigns::CommentMarkedAsSpam < Campaigns::NotificationCampaign
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def self.consentable_roles
      ['admin', 'project_moderator']
    end

    def activity_triggers
      {'Notifications::CommentMarkedAsSpam' => {'created' => true}}
    end
  end
end