# frozen_string_literal: true

module EmailCampaigns
  class EventRegistrationConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::EventRegistrationConfirmation)
    end
  end
end
