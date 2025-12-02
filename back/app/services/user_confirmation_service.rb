# frozen_string_literal: true

# Service for validating and confirming user email addresses via confirmation codes.
# Handles validation of codes, retry counting, and user confirmation.
#
# @example
#   service = UserConfirmationService.new
#   result = service.validate_and_confirm!(user, '1234')
#
#   if result.success?
#     # User confirmed successfully
#   else
#     # result.errors contains validation errors
#   end
class UserConfirmationService
  class ValidationError < StandardError
    attr_reader :field, :error_code, :options

    def initialize(field, error_code, options = {})
      @field = field
      @error_code = error_code
      @options = options
      super("Validation failed: #{field} - #{error_code}")
    end
  end

  ConfirmationResult = Struct.new(:success, :user, :errors, keyword_init: true) do
    def success?
      success
    end

    def failure?
      !success
    end
  end

  def validate_and_confirm!(user, code)
    validate_user!(user)
    validate_retry_count!(user, code)
    validate_code_value!(user, code)
    validate_code_expiration!(user)
    confirm_user!(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  private

  def validate_user!(user)
    raise ValidationError.new(:user, :blank) if user.blank?
  end

  def validate_retry_count!(user, code)
    return if user.email_confirmation_code == code # don't increment unless code is wrong

    user.email_confirmation_retry_count += 1
    return if user.save

    raise ValidationError.new(:code, :too_many_retries)
  end

  def validate_code_value!(user, code)
    raise ValidationError.new(:code, :blank) if code.blank?

    return if user.email_confirmation_code == code

    raise ValidationError.new(:code, :invalid)
  end

  def validate_code_expiration!(user)
    return unless user.email_confirmation_code_expiration_at < Time.zone.now

    raise ValidationError.new(:code, :expired)
  end

  def confirm_user!(user)
    return if user.confirm!

    raise ValidationError.new(:user, :confirmation, message: 'Something went wrong.')
  end

  def success_result(user)
    ConfirmationResult.new(success: true, user: user, errors: nil)
  end

  def failure_result(validation_error)
    errors = build_errors(validation_error)
    ConfirmationResult.new(success: false, user: nil, errors: errors)
  end

  def build_errors(validation_error)
    # Use a simple object for error base to satisfy ActiveModel::Errors
    error_base = Object.new
    error_base.define_singleton_method(:read_attribute_for_validation) { |_attr| nil }

    errors = ActiveModel::Errors.new(error_base)
    errors.add(
      validation_error.field,
      validation_error.error_code,
      **validation_error.options
    )
    errors
  end
end
