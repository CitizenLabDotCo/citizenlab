module EmailCampaigns
  class Campaigns::NotificationCampaign < Campaign
    include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_notification_recipient

    def activity_triggers
      {"Notifications::#{self.class.name.split('::').last}" => {'created' => true}}
    end

    def filter_notification_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.recipient.id)
    end

    def generate_commands recipient:, activity:
      notification = activity.item
      [{
        event_payload: serialize_campaign(notification).values.first,
      }]
    end

  end
end