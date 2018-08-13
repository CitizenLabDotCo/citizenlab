module EmailCampaigns
  class CampaignDispatchingService
    include TriggeredCampaign

    CAMPAIGNS = [
      Campaigns::CommentOnYourComment,
      Campaigns::AdminWeeklyReport
    ]

    def all_campaigns
      CAMPAIGNS
    end

    private

    def on_incoming_event event
      triggered_campaigns.select do |campaign|
        campaign.triggered_by? event[:event]
      end

      commands = triggered_campaigns
        .map{|campaign| [campaign, campaign.build_email_commands_on_event(event)].compact}
        .flat_map{|campaign, commands| commands.map{|command| [campaign, command]}}
        .each do |campaign, command|
          begin
            command.update_attributes(
              commanded_at: Time.now,
              campaign: campaign.name
            )
            submit_command(command) if command.save!
          rescue Exception => e
            Rails.logger.error e
          end
        end
    end


    def submit_command command
      PublishRawEventJob.perform_later(
        command.event_payload,
        routing_key: "emails.#{command.campaign.underscore}.command"
      )
    end

  end
end