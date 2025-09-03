# frozen_string_literal: true

module EmailCampaigns
  class WelcomeMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::Welcome)
    end
  end
end
