# frozen_string_literal: true

module UserConfirmation
  extend ActiveSupport::Concern

  included do
    with_options if: -> { user_confirmation_enabled? } do
      before_validation :set_confirmation_required
      before_validation :confirm, if: ->(user) { user.invite_status_change&.last == 'accepted' }
    end

    with_options if: -> { user_confirmation_enabled? } do
      validates :email_confirmation_code, format: { with: USER_CONFIRMATION_CODE_PATTERN }, allow_nil: true
      validates :email_confirmation_retry_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
      validates :email_confirmation_code_reset_count, numericality: { less_than_or_equal_to: ENV.fetch('EMAIL_CONFIRMATION_MAX_RETRIES', 5) }
    end
  end

  # true if the user has not yet confirmed their email address and the platform requires it
  def confirmation_required?
    user_confirmation_enabled? && confirmation_required
  end

  def confirm
    self.email_confirmed_at = Time.zone.now
    self.confirmation_required = false
  end

  def confirm!
    return if !confirmation_required? && !new_email

    confirm_new_email if new_email.present?
    confirm
    save!
  end

  def reset_confirmation_and_counts
    if !confirmation_required?
      # Only reset code and retry/reset counts if account has already been confirmed
      # To keep limits in place for retries when not confirmed
      self.email_confirmation_code = nil
      self.email_confirmation_retry_count = 0
      self.email_confirmation_code_reset_count = 0
    end
    self.confirmation_required = true
    self.email_confirmation_code_sent_at = nil
  end

  def should_send_confirmation_email?
    confirmation_required? && email_confirmation_code_sent_at.nil?
  end

  def email_confirmation_code_expiration_at
    email_confirmation_code_sent_at + 1.day
  end

  def reset_confirmation_code
    self.email_confirmation_code = Rails.env.development? ? '1234' : rand.to_s[2..5]
  end

  def increment_confirmation_code_reset_count
    self.email_confirmation_code_reset_count += 1
  end

  def increment_confirmation_retry_count!
    self.email_confirmation_retry_count += 1
    save!
  end

  private

  def set_confirmation_required
    return unless new_record? && email_changed?

    return unless confirmation_required # to be able to create a confirmed user

    confirmation_not_required = invite_status.present? || active?
    self.confirmation_required = !confirmation_not_required
  end

  def confirm_new_email
    return unless new_email

    self.email = new_email
    self.new_email = nil
  end

  def user_confirmation_enabled?
    @user_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('user_confirmation')
  end
end
