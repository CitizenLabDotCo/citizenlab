# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  # Guards a request for an in-place email confirmation code (the
  # request_code_email action). `record` is the User the code would be sent to —
  # looked up from the submitted `email` param, or current_user when no email is
  # given (see the controller). `user` is current_user (nil for unauthenticated
  # callers, since the action skips authenticate_user).
  #
  # There are exactly three legitimate situations:
  #
  #   1. email param + no authenticated user: the public flow (email signup /
  #      passwordless login). `record` is the account that owns the submitted
  #      email; there is no current_user to check it against.
  #
  #   2. no email param + authenticated user: re-confirmation of one's own email
  #      (its confirmed_email_expiry window has elapsed). The controller falls
  #      back to current_user, so `record == user`.
  #
  #   3. email param + authenticated user: same as (2) but the email is passed
  #      explicitly. It MUST resolve to the authenticated user's own account
  #      (`record == user`); an authenticated caller may never request a code for
  #      someone else's email.
  #
  # In short: whenever there is an authenticated user, the code may only be sent
  # to that same user. That single rule covers cases (2) and (3) and rejects the
  # "logged in, but asking for another account's email" case.
  def request_code_email?
    return false unless app_configuration.feature_activated?('password_login')
    return false if record.nil?
    return false if record.email.blank?

    # An authenticated caller may only request a code for their own email.
    return false if user && user != record

    return false if record.email_confirmation.code_reset_count >= max_retries - 1

    true
  end

  # For authenticated users changing their email
  def request_code_new_email?
    return false if user.nil?
    return false if user.new_email_confirmation.code_reset_count >= max_retries - 1

    true
  end

  # For authenticated users adding/changing their phone number
  def request_code_new_phone?
    return false unless app_configuration.feature_activated?('sms')
    return false if user.nil?
    return false if user.new_phone_confirmation.code_reset_count >= max_retries - 1

    true
  end

  private

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def max_retries
    ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
