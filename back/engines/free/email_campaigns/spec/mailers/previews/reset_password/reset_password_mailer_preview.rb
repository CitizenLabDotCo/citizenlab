# frozen_string_literal: true

class ResetPasswordMailerPreview < ActionMailer::Preview
  def send_confirmation_code
    user = User.first
    user.save
    ::ResetPasswordMailer.with(user: user, password_reset_url: 'https://demo.stg.citizenlab.co').send_reset_password
  end
end
