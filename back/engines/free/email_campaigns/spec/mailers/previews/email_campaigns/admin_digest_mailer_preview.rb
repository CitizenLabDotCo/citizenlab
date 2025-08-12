# frozen_string_literal: true

module EmailCampaigns
  class AdminDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::AdminDigest)
    end
  end
end
