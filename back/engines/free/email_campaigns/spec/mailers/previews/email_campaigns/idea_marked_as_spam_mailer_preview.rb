# frozen_string_literal: true

module EmailCampaigns
  class IdeaMarkedAsSpamMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::EventRegistrationConfirmation)
    end
  end
end
