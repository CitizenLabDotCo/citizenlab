module EmailCampaigns
  class Campaigns::InviteReceived < Campaign
  	include Disableable
    include ActivityTriggerable
    include RecipientConfigurable

    recipient_filter :filter_recipient


    def activity_triggers
      {'Invite' => {'created' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.invitee.id)
    end

    def generate_commands recipient:, activity:
      [{
        event_payload: serialize_campaign(activity.item)
      }]
    end
  end
end