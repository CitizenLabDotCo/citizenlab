# frozen_string_literal: true

module ResetPassword
  class ResetPasswordMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreview

    def campaign_mail
      preview_campaign_mail(EmailCampaigns::Campaigns::PasswordReset)
    end
  end
end
