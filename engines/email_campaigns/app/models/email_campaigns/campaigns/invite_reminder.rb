module EmailCampaigns
  class Campaigns::InviteReminder < Campaign
    include ActivityTriggerable
    include Disableable

    recipient_filter :filter_recipient


    def activity_triggers
      {'Invite' => {'not_accepted_since_3_days' => true}}
    end

    def filter_recipient users_scope, activity:, time: nil
      users_scope.where(id: activity.item.invitee.id)
    end

    def generate_commands recipient:, activity:
      [{
        event_payload: serialize_campaign(activity.item)
      }]
    end


    protected

    def set_enabled
      self.enabled = false if self.enabled.nil?
    end
  end
end