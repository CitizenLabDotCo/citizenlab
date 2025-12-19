# frozen_string_literal: true

module PhoneConfirmation
  extend ActiveSupport::Concern

  included do
    with_options if: -> { phone_confirmation_enabled? } do
      validates :phone_confirmation_code, format: { with: PHONE_CONFIRMATION_CODE_PATTERN }, allow_nil: true
      validates :phone_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('PHONE_CONFIRMATION_MAX_RETRIES', 5) }
      validates :phone_confirmation_code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('PHONE_CONFIRMATION_MAX_RETRIES', 5) }
    end
  end

  def phone_confirmation_required?
    phone_confirmation_enabled? && phone_confirmation_required
  end

  def confirm_phone
    self.phone_confirmed_at = Time.zone.now
    self.phone_confirmation_required = false
    self.phone_confirmation_code = nil
    self.phone_confirmation_code_reset_count = 0
  end

  def confirm_phone!
    return unless phone_confirmation_required?

    confirm_phone
    save!
  end

  def phone_confirmation_code_expiration_at
    phone_confirmation_code_sent_at + phone_confirmation_code_duration
  end

  def reset_phone_confirmation_code!
    self.phone_confirmation_code = generate_phone_confirmation_code
    self.phone_confirmation_code_reset_count += 1
    self.phone_confirmation_retry_count = 0
    self.phone_confirmation_required = true
    save!
  end

  def expire_phone_confirmation_code!
    update!(phone_confirmation_code: generate_phone_confirmation_code)
  end

  private

  def phone_confirmation_enabled?
    @phone_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('phone_confirmation')
  end

  def generate_phone_confirmation_code
    Rails.env.development? ? '123456' : rand.to_s[2..7]
  end

  def phone_confirmation_code_duration
    24.hours
  end
end
