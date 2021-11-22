# frozen_string_literal: true

require 'jwt'

class ResetPasswordService
  def generate_reset_password_token(user:)
    payload = {
      id: user.id,
      exp: (Time.zone.now + 1.hour).to_i
    }

    JWT.encode(payload, secret, 'HS256')
  end

  def deliver_email_later(user:, token:)
    password_reset_url = password_reset_url_for(user, token)
    EmailCampaigns::PasswordResetMailer.with(password_reset_url: password_reset_url, user: user)
                                       .campaign_mail.deliver_later(priority: 1)
  end

  def token_valid?(user, token)
    payload = JWT.decode(token, secret, true, { algorithm: 'HS256' })
    payload[0]['id'] == user.id
  rescue JWT::ExpiredSignature
    false
  end

  private

  def secret
    Rails.application.secrets.secret_key_base
  end

  def password_reset_url_for(_user, token)
    Frontend::UrlService.new.reset_password_url(token, locale: recipient.locale)
  end
end
