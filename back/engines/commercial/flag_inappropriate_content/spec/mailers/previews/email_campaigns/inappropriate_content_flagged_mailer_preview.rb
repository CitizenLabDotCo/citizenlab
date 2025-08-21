# frozen_string_literal: true

module EmailCampaigns
  class InappropriateContentFlaggedPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::InappropriateContentFlagged)
    end
  end
end
