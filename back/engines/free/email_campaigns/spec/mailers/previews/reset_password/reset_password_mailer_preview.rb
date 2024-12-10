# frozen_string_literal: true

module ResetPassword
  class ResetPasswordMailerPreview < ActionMailer::Preview
    include EmailCampaigns::MailerPreviewRecipient

    def send_confirmation_code
      ::ResetPasswordMailer.with(user: recipient_user, password_reset_url: 'https://demo.stg.govocal.com').send_reset_password
    end
  end
end
