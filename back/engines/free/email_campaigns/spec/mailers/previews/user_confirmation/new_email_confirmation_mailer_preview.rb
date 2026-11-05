# frozen_string_literal: true

module UserConfirmation
  class NewEmailConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::NewEmailConfirmation)
    end
  end
end
