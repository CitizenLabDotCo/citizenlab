# frozen_string_literal: true

class RequestCodePolicy < ApplicationPolicy
  # For unauthenticated code requests (email signup/passwordless login)
  def request_code_unauthenticated?
    return false unless correct_feature_flags_enabled?
    return false if record.nil?
    return false if record.email.blank?

    if record.password_digest? && !record.confirmation_required?
      return false
    end

    return false if record.new_email.present?
    return false if record.email_confirmation_code_reset_count >= max_retries - 1

    true
  end

  # For authenticated users changing their email
  def request_code_email_change?
    return false unless app_configuration.feature_activated?('user_confirmation')
    return false if user.nil?
    return false if user.email_confirmation_code_reset_count >= max_retries - 1

    true
  end

  private

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def correct_feature_flags_enabled?
    app_configuration.feature_activated?('password_login') &&
      app_configuration.feature_activated?('user_confirmation')
  end

  def max_retries
    ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
