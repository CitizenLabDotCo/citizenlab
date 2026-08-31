# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  def request_code_email?
    return false unless user.nil?
    return false unless app_configuration.feature_activated?('password_login')
    return false if record.nil?
    return false if record.email.blank?
    return false if password_set?(record)
    return false if code_reset_count(record.email_confirmation) >= max_retries - 1

    true
  end

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
    return false if password_set?(record)
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

  def password_set?(record)
    record.password_digest.present?
  end

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
