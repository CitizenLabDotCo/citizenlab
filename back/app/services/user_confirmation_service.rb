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
  # Custom exception for validation failures
  class ValidationError < StandardError
    attr_reader :field, :error_code, :options

    def initialize(field, error_code, options = {})
      @field = field
      @error_code = error_code
      @options = options
      super("Validation failed: #{field} - #{error_code}")
    end
  end

  # Result object returned by validation and confirmation
  ConfirmationResult = Struct.new(:success, :user, :errors, keyword_init: true) do
    def success?
      success
    end

    def failure?
      !success
    end
  end

  # Validates the confirmation code and confirms the user if valid.
  # Functionally identical to ConfirmUser interactor.
  #
  # @param user [User, nil] The user attempting to confirm
  # @param code [String, nil] The confirmation code to validate
  # @return [ConfirmationResult] Result with success status and any errors
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

  # Validates that user is present
  # @raise [ValidationError] if user is nil
  def validate_user!(user)
    raise ValidationError.new(:user, :blank) unless user.present?
  end

  # Increments retry count if code doesn't match, fails if limit exceeded
  # @raise [ValidationError] if retry limit exceeded
  def validate_retry_count!(user, code)
    return if user.email_confirmation_code == code # don't increment unless code is wrong

    user.email_confirmation_retry_count += 1
    return if user.save

    raise ValidationError.new(:code, :too_many_retries)
  end

  # Validates that code is present and matches user's code
  # @raise [ValidationError] if code is blank or invalid
  def validate_code_value!(user, code)
    raise ValidationError.new(:code, :blank) if code.blank?

    return if user.email_confirmation_code == code

    raise ValidationError.new(:code, :invalid)
  end

  # Validates that code hasn't expired
  # @raise [ValidationError] if code is expired
  def validate_code_expiration!(user)
    return unless user.email_confirmation_code_expiration_at < Time.zone.now

    raise ValidationError.new(:code, :expired)
  end

  # Confirms the user account
  # @raise [ValidationError] if confirmation fails
  def confirm_user!(user)
    return if user.confirm!

    raise ValidationError.new(:user, :confirmation, message: 'Something went wrong.')
  end

  # Builds success result
  def success_result(user)
    ConfirmationResult.new(success: true, user: user, errors: nil)
  end

  # Builds failure result from validation error
  def failure_result(validation_error)
    errors = build_errors(validation_error)
    ConfirmationResult.new(success: false, user: nil, errors: errors)
  end

  # Converts ValidationError to ActiveModel::Errors for controller compatibility
  def build_errors(validation_error)
    # Use a simple object for error base to satisfy ActiveModel::Errors
    error_base = Object.new
    error_base.define_singleton_method(:read_attribute_for_validation) { |attr| nil }

    errors = ActiveModel::Errors.new(error_base)
    errors.add(
      validation_error.field,
      validation_error.error_code,
      **validation_error.options
    )
    errors
  end
end
