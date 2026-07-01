# frozen_string_literal: true

module UserConfirmation
  class EmailConfirmationMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::EmailConfirmation)
    end
  end
end
