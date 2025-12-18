# frozen_string_literal: true

class PhoneConfirmationPolicy < ApplicationPolicy
  def send_confirmation_code?
    # return false unless app_configuration.feature_activated?('phone_confirmation')
    return false if user.nil?
    return false if user.phone_confirmation_code_reset_count >= max_retries - 1
  end

  private

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end

  def max_retries
    ENV.fetch('PHONE_CONFIRMATION_MAX_RETRIES', 5).to_i
  end
end
