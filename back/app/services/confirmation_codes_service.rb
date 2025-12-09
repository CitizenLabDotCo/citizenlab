# frozen_string_literal: true

class ConfirmationCodesService
  MAX_RETRIES = ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i

  def permit_request_code_unauthenticated(user)
    return false unless correct_feature_flags_enabled?
    return false if user.nil?
    return false if user.email.blank?
    return false if user.password_digest?
    return false if user.email_confirmation_code_reset_count >= MAX_RETRIES - 1

    true
  end

  def permit_request_code_authenticated(user)
    return false unless correct_feature_flags_enabled?
    return false if user.nil?
    return false if user.email.blank?
    return false if user.email_confirmation_code_reset_count >= MAX_RETRIES - 1
    return false unless user.confirmation_required?

    true
  end

  def permit_request_code_email_change(user, new_email)
    return false unless correct_feature_flags_enabled?
    return false if user.nil?
    return false if new_email.blank?
    return false if user.email_confirmation_code_reset_count >= MAX_RETRIES - 1

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
end
