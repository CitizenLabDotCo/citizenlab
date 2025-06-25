# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    # TODO: Most of this code is generic and could be moved to a shared module
    def campaign_mail
      campaign = EmailCampaigns::Campaigns::AdminDigest.new
      command = campaign.mailer_class.preview_command(recipient: recipient_user)
      campaign.mailer_class.with(campaign: campaign, command: command).campaign_mail
    end
  end
end
