module EmailCampaigns::Campaigns
  class CommentOnYourComment < Campaign
    include TriggeredCampaign

    TRIGGERS = [
      "Notification for Comment on your comment created"
    ]

    def make_email_commands_on_event event
      notification = Notification.find(event[:item_id])
      CamppaignEmailCommand.new(
        event_payload: serialize_command(notification),
        recipient: event[:user_id]
      )
    end

  end
end