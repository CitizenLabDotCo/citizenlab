# frozen_string_literal: true

module EmailCampaigns
  class AssigneeDigestMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::AssigneeDigest)
    end
  end
end
