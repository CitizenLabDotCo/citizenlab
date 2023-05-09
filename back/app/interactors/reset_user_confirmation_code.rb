# frozen_string_literal: true

class ResetUserConfirmationCode < ApplicationInteractor
  delegate :user, :first_code, to: :context

  def call
    validate_code
    validate_confirmation_reset_count
    user.save!
  end

  def validate_code
    context.first_code = user.email_confirmation_code.nil?
    user.reset_confirmation_code
    return if user.valid_attribute?(:email_confirmation_code)

    fail_with_error! :code, :invalid, message: 'The code is invalid.'
  end

  def validate_confirmation_reset_count
    user.increment_confirmation_code_reset_count! unless first_code
  rescue ActiveRecord::RecordInvalid => _e
    fail_with_error! :code, :too_many_resets, message: 'You\'ve reset too many times.'
  end
end
