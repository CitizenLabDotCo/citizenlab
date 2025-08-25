# frozen_string_literal: true

module EmailCampaigns
  class ThresholdReachedForAdminMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::ThresholdReachedForAdmin)
    end
  end
end
