# frozen_string_literal: true

class ConfirmUser < ApplicationInteractor
  delegate :user, :code, to: :context

  def call
    validate_user
    validate_retry_count
    validate_code_value
    validate_code_expiration
    confirm_user
  end

  def validate_user
    return if user.present?

    fail_with_error! :user, :blank
  end

  def validate_code_expiration
    return unless user.email_confirmation_code_expiration_at < Time.zone.now

    fail_with_error! :code, :expired
  end

  def validate_retry_count
    return if user.email_confirmation_code == code # don't increment unless code is valid

    return if user.increment_confirmation_retry_count!

    fail_with_error! :code, :too_many_retries
  end

  def validate_code_value
    fail_with_error! :code, :blank if code.blank?

    return if user.email_confirmation_code == code

    fail_with_error! :code, :invalid
  end

  def confirm_user
    return fail_with_error!(:user, :confirmation, message: 'Something went wrong.') unless user.confirm!

    ClaimTokenService.complete(user)
  end
end
