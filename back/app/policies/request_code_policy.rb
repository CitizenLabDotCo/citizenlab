# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  # Guards a request for an in-place email confirmation code (the
  # request_code_email action). That action serves the public flow only - email
  # signup and passwordless login - so `record` is the account that owns the
  # submitted `email` param and `user` (current_user) must be nil. A signed-in
  # user re-confirming their own email goes through request_reconfirm_code_email?
  # instead, which is why an authenticated caller is rejected outright rather
  # than checked for ownership.
  def request_code_email?
    return false unless user.nil?
    return false unless app_configuration.feature_activated?('password_login')
    return false if record.nil?
    return false if record.email.blank?
    return false if code_reset_count(record.email_confirmation) >= max_retries - 1

    true
  end

  # Guards a re-confirmation code for the signed-in user's own email. Not gated
  # by password_login: an account created through SSO must still be able to
  # re-confirm. `record` is current_user (see the controller).
  def request_reconfirm_code_email?
    return false if user.nil?
    return false if user.email.blank?
    return false if code_reset_count(user.email_confirmation) >= max_retries - 1

    true
  end

  # For authenticated users changing their email
  def request_code_new_email?
    return false if user.nil?
    return false if code_reset_count(user.new_email_confirmation) >= max_retries - 1

    true
  end

  # The phone mirror of request_code_email?: phone signup / passwordless login,
  # with the account looked up from the submitted `phone` param.
  def request_code_phone?
    return false unless user.nil?
    return false unless app_configuration.feature_activated?('password_login')
    return false unless app_configuration.feature_activated?('sms')
    return false unless app_configuration.feature_activated?('sms_login')
    return false if record.nil?
    return false if record.phone.blank?
    return false if code_reset_count(record.phone_confirmation) >= max_retries - 1

    true
  end

  # The phone mirror of request_reconfirm_code_email?. The sms feature is still
  # required, since it carries the settings the code is sent through.
  def request_reconfirm_code_phone?
    return false if user.nil?
    return false unless app_configuration.feature_activated?('sms')
    return false if user.phone.blank?
    return false if code_reset_count(user.phone_confirmation) >= max_retries - 1

    true
  end

  # For authenticated users adding/changing their phone number
  def request_code_new_phone?
    return false unless app_configuration.feature_activated?('sms')
    return false if user.nil?
    return false if code_reset_count(user.new_phone_confirmation) >= max_retries - 1

    true
  end

  private

  def code_reset_count(confirmation)
    confirmation&.code_reset_count || 0
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def max_retries
    ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
