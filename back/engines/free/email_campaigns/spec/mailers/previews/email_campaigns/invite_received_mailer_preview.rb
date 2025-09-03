# frozen_string_literal: true

module EmailCampaigns
  class InviteReceivedMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InviteReceived)
    end
  end
end
