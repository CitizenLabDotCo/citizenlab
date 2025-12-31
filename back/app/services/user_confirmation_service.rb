# frozen_string_literal: true

# Service for validating and confirming user email addresses via confirmation codes.
# Handles validation of codes, retry counting, and user confirmation.
#
# @example
#   service = UserConfirmationService.new
#   result = service.validate_and_confirm_unauthenticated!(user, '1234')
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

  def validate_and_confirm_unauthenticated!(user, code)
    # Ensure that password login (i.e. 'normal', non-SSO login)
    # feature is enabled for unauthenticated confirmation
    validate_password_login_enabled!
    validate_user!(user)
    validate_email!(user.email)
    validate_user_has_no_new_email!(user)
    validate_and_confirm!(user, code)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  def validate_and_confirm_email_change!(user, code)
    validate_user!(user)
    validate_email!(user.new_email)
    validate_and_confirm!(user, code)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  private

  def validate_and_confirm!(user, code)
    validate_user_confirmation_enabled!
    validate_retry_count!(user, code)
    validate_code_value!(user, code)
    validate_code_expiration!(user)
    confirm_user!(user)
  end

  def validate_password_login_enabled!
    return if app_configuration.feature_activated?('password_login')

    raise ValidationError.new(:base, :password_login_feature_disabled)
  end

  def validate_user_confirmation_enabled!
    return if app_configuration.feature_activated?('user_confirmation')

    raise ValidationError.new(:base, :user_confirmation_feature_disabled)
  end

  def validate_user!(user)
    raise ValidationError.new(:user, :blank) if user.blank?
  end

  def validate_email!(email)
    raise ValidationError.new(:user, :no_email) if email.blank?
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

  def validate_user_confirmation_required!(user)
    return if user.confirmation_required?

    raise ValidationError.new(:base, :confirmation_not_required)
  end

  # This one is in the case where a user does not have a password,
  # and is trying to change their email, but has not confirmed their new email yet.
  # In this situation, we do not allow them to confirm their email with this endpoint.
  # The first reason is because right now, they could confirm their new email using a
  # new code sent to their old email, which we don't want.
  # We could wipe the new_email before, but then the issue is that they can basically
  # request infinite codes and brute-force the code.
  # I could refactor everything and not reseet the reset email_confirmation_code_reset_count
  # in this case, but it's too much work for now so I'll do it later.
  def validate_user_has_no_new_email!(user)
    return if user.new_email.blank?

    raise ValidationError.new(:user, :has_new_email)
  end

  def confirm_user!(user)
    if user.confirm!
      ClaimTokenService.complete(user)
    else
      raise ValidationError.new(
        :user, :confirmation, message: 'Something went wrong.'
      )
    end
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

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end
end
