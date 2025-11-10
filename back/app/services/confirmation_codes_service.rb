# frozen_string_literal: true

class ConfirmationCodesService
  MAX_RETRIES = ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5).to_i

  def permit_request_code_unauthenticated(user)
    puts "=" * 20
    puts "fajewpiofjareg1"
    puts "=" * 20
    return false unless correct_feature_flags_enabled?
    puts "=" * 20
    puts "fajewpiofjareg2"
    puts "=" * 20
    return false if user.nil?
    puts "=" * 20
    puts "fajewpiofjareg3"
    puts "=" * 20
    return false if user.email.blank?
    puts "=" * 20
    puts "fajewpiofjareg4"
    puts "=" * 20
    return false if user.password_digest?
    puts "=" * 20
    puts "fajewpiofjareg5"
    puts "=" * 20
    return false if user.email_confirmation_code_reset_count >= MAX_RETRIES - 1
    puts "=" * 20
    puts "=" * 20

    true
  end

  def permit_request_code_authenticated(user)
    return false unless correct_feature_flags_enabled?
    return false if user.nil?
    return false if user.email.blank?
    return false unless user.password_digest?
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
