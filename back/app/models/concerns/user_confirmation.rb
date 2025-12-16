# frozen_string_literal: true

module UserConfirmation
  extend ActiveSupport::Concern

  included do
    with_options if: -> { user_confirmation_enabled? } do
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
    # if the user registered via SSO, but the SSO did not return an email:
    # we only say that the user requires confirmation if they have requested to set their
    # email.
    # If they haven't, we will regard them as not requiring confirmation.
    is_verified_sso_user_without_email = sso? && verified && email.nil? && new_email.nil?

    user_confirmation_enabled? && confirmation_required && !is_verified_sso_user_without_email
  end

  def confirm
    self.email_confirmed_at = Time.zone.now
    self.confirmation_required = false
    self.email_confirmation_code = nil
    self.email_confirmation_code_reset_count = 0
  end

  def confirm!
    return unless confirmation_required?

    confirm_new_email if new_email.present?
    confirm
    save!

    # Cancel any other pending email changes initiated with the same email to prevent
    # those users from becoming invalid due to email validations.
    User
      .where(new_email: email)
      .update_all(new_email: nil, email_confirmation_code: nil, updated_at: Time.zone.now)
  end

  def email_confirmation_code_expiration_at
    email_confirmation_code_sent_at + confirmation_code_duration
  end

  def reset_confirmation_code!
    self.email_confirmation_code = generate_confirmation_code
    self.email_confirmation_code_reset_count += 1
    self.email_confirmation_retry_count = 0
    self.confirmation_required = true
    save!
  end

  def expire_confirmation_code!
    update!(email_confirmation_code: generate_confirmation_code)
  end

  # ONLY USED IN SPECS!
  def reset_confirmation_and_counts
    raise 'Only use in specs!' unless Rails.env.test?

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

  private

  def confirm_new_email
    return unless new_email

    self.email = new_email
    self.new_email = nil
  end

  def user_confirmation_enabled?
    @user_confirmation_enabled ||= AppConfiguration.instance.feature_activated?('user_confirmation')
  end

  def generate_confirmation_code
    Rails.env.development? ? '1234' : rand.to_s[2..5]
  end

  def confirmation_code_duration
    24.hours
  end
end
