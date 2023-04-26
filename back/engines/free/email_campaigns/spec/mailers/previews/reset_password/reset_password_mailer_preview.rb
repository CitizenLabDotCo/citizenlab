# frozen_string_literal: true

class ResetPasswordMailerPreview < ActionMailer::Preview
  include EmailCampaigns::MailerPreviewRecipient

  def send_confirmation_code
    ::ResetPasswordMailer.with(user: recipient_user, password_reset_url: 'https://demo.stg.citizenlab.co').send_reset_password
  end
end
