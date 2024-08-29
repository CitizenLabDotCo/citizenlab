# frozen_string_literal: true

module EmailCampaigns
  class AdminRightsReceivedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      # TODO: generate commands with campaign#generate_commands method
      command = {
        recipient: recipient_admin,
        event_payload: {}
      }
      campaign = EmailCampaigns::Campaigns::AdminRightsReceived.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
