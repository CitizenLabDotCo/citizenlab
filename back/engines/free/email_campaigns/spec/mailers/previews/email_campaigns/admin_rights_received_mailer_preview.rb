module EmailCampaigns
  class AdminRightsReceivedMailerPreview < ActionMailer::Preview
    def campaign_mail
      recipient = User.admin.first
      command = {
        recipient: recipient,
        event_payload: {
          
        }
      }
      campaign = EmailCampaigns::Campaigns::AdminRightsReceived.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end