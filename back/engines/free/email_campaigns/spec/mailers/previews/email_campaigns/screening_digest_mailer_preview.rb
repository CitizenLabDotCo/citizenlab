# frozen_string_literal: true

module EmailCampaigns
  class ScreeningDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ScreeningDigest)
    end
  end
end
