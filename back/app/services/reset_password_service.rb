# frozen_string_literal: true

require 'jwt'

# Contains business logic for handling password resets for users via emails
# like generating, validating tokens and sending emails.
class ResetPasswordService
  # Generates a password reset token for the specified user, valid for 1 hour.
  # @param user [User] The user for whom the token should be generated
  # @return [String] returns the generated token as a `String`
  def generate_reset_password_token(user)
    payload = {
      id: user.id,
      exp: 1.hour.from_now.to_i
    }

    JWT.encode(payload, secret, 'HS256')
  end

  # Schedules an email to the user with instructions on how to reset their password
  # after a token has been generated (and saved to the user record).
  # @param user [User] the recipient of the user
  # @param token [String] the password reset token for the user
  # @return [void]
  def send_email_later(user, token)
    url = url_for(user, token)
    ResetPasswordMailer.with(user: user, password_reset_url: url)
                       .send_reset_password
                       .deliver_later(priority: 1)
  end

  # Verifies if the specified token is valid for the user.
  # @param user [User] the user who belongs to the reset token
  # @param token [String] token to be checked
  # @return [Boolean] true if the token is valid, false otherwise
  def token_valid?(user, token)
    payload = JWT.decode(token, secret, true, { algorithm: 'HS256' })
    payload[0]['id'] == user.id
  rescue JWT::ExpiredSignature, JWT::DecodeError
    false
  end

  # Schedules a `LogActivityJob` which creates an activity to document that
  # a password reset has been requested for the user.
  # @param user [User] the user who requested the password reset
  # @param token [String] the generated token
  # @return [void]
  def log_activity(user, token)
    LogActivityJob.perform_later(
      user, 'requested_password_reset', user, Time.now.to_i,
      payload: { token: token }
    )
  end

  private

  def url_for(user, token)
    Frontend::UrlService.new.reset_password_url(token, locale: user.locale)
  end

  def secret
    Rails.application.secrets.secret_key_base
  end
end
