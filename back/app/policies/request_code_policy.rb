# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  # For unauthenticated code requests (email signup/passwordless login)
  def request_code_unauthenticated?
    return false unless app_configuration.feature_activated?('password_login')
    return false if record.nil?
    return false if record.email.blank?

    if record.password_digest? && !record.confirmation_required?
      return false
    end

    return false if code_reset_limit_reached?(record.email_confirmation)

    true
  end

  # For authenticated users changing their email
  def request_code_email_change?
    return false if user.nil?
    return false if code_reset_limit_reached?(user.new_email_confirmation)

    true
  end

  # For authenticated users adding/changing their phone number
  def request_code_phone_change?
    return false unless app_configuration.feature_activated?('sms')
    return false if user.nil?
    return false if code_reset_limit_reached?(user.new_phone_confirmation)

    true
  end

  private

  # Users who predate a confirmation type have no record for it yet — the request
  # job creates one on first use.
  def code_reset_limit_reached?(confirmation)
    return false if confirmation.nil?

    confirmation.code_reset_count >= max_retries - 1
  end

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def max_retries
    ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
