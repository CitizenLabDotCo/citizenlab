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
    validate_password_login_enabled!()
    validate_user!(user)
    validate_user_has_email!(user)
    validate_user_has_no_password!(user)
    validate_and_confirm!(user, code)
  end

  def validate_and_confirm_authenticated!(user, code)
    # For authenticated confirmation, it is possible that people
    # have password login disabled, and that they signed in with e.g.
    # clave unica which does not return an email. In this case, they
    # still need to enter their email and confirm it.
    validate_user!(user)
    validate_user_has_email!(user)
    validate_user_confirmation_required!(user)
    validate_and_confirm!(user, code)
  end

  private

  def validate_and_confirm!(user, code)
    validate_user_confirmation_enabled!()
    validate_retry_count!(user, code)
    validate_code_value!(user, code)
    validate_code_expiration!(user)
    confirm_user!(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
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

  def validate_user_has_email!(user)
    raise ValidationError.new(:user, :no_email) if user.email.blank?
  end

  def validate_user_has_no_password!(user)
    raise ValidationError.new(:user, :has_password) if user.password_digest?
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

  def app_configuration
    @app_configuration ||= AppConfiguration.instance
  end
end
