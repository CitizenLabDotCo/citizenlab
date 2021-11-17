# frozen_string_literal: true

require 'jwt'

# Handles password resets for user accounts
class ResetPasswordService
  # Generates a password reset token for the specified user that expires in one hour from now.
  # @param user [User] the user for whom the pass word reset token should be created
  # @return [String] the generated token
  def generate_reset_password_token(user)
    payload = {
      id: user.id,
      exp: (Time.zone.now + 1.hour).to_i
    }

    JWT.encode payload, secret, 'HS256'
  end

  # Checks if the token is valid for the specified user.
  # @param token [String] token that should be verified
  # @param user [User] user record that should be verified
  # @return Boolean true if the token is valid; false otherwise
  def token_valid?(user, token)
    payload = JWT.decode token, secret, true, { algorithm: 'HS256' }
    payload[0]['id'] == user.id
  rescue JWT::ExpiredSignature
    false
  end

  def secret
    Rails.application.secrets.secret_key_base
  end

  # Schedules a job to log an activity that a password reset token has been
  # created for a user.
  # @param token [String] token that has been created
  # @param user [User] user to whom the token belongs
  def log_password_reset_activity(user, token)
    LogActivityJob.set(wait: 2.seconds).perform_later(
      user, 'requested_password_reset', user, Time.now.to_i,
      payload: { token: token }
    )
  end
end
