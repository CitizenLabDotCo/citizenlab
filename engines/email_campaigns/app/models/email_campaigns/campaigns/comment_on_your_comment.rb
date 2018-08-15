module EmailCampaigns
  class Campaigns::CommentOnYourComment < Campaign
    include Disableable
    include Consentable
    include ActivityTriggerable
    include RecipientConfigurable

    def self.activity_triggers
      [
        {'Notification for Comment on your comment' => {'created' => true}}
      ]
    end

    def generate_command recipient:, activity:
      notification = activity.item
      {
        event_payload: serialize_campaign(notification),
      }
    end

  end
end