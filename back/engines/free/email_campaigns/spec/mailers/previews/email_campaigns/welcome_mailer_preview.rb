# frozen_string_literal: true

module EmailCampaigns
  class WelcomeMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def campaign_mail
      command = {
        recipient: recipient_user
      }
      campaign = EmailCampaigns::Campaigns::Welcome.first

      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
