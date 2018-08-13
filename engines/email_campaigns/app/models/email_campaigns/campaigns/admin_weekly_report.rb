module EmailCampaigns::Campaigns
  class AdminWeeklyReport < Campaign
    include DigestCampaign

    SCHEDULABLE = true
   
    def make_email_commands_on_schedule schedule
      CampaignEmailCommand.new(
        event_payload: ,
        recipient: ,
      )
    end

  end
end