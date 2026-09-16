# frozen_string_literal: true

# Service for validating and confirming user email addresses via confirmation codes.
# Handles validation of codes, retry counting, and user confirmation.
#
# @example
#   service = UserConfirmationService.new
#   result = service.validate_and_confirm_email!(user, '1234')
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

  def validate_and_confirm_email!(user, code)
    # Ensure that password login (i.e. 'normal', non-SSO login)
    # feature is enabled for email confirmation
    validate_password_login_enabled!
    validate_user!(user)
    validate_email!(user.email)
    validate_and_confirm!(user.email_confirmation, code)
    ClaimTokenService.complete(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  # Re-confirmation of the user's own `email` by an authenticated caller. Unlike
  # validate_and_confirm_email!, it isn't gated by password_login: an account
  # created through SSO must still be able to re-confirm.
  def validate_and_reconfirm_email!(user, code)
    validate_user!(user)
    validate_email!(user.email)
    validate_and_confirm!(user.email_confirmation, code)
    ClaimTokenService.complete(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  def validate_and_confirm_new_email!(user, code)
    validate_user!(user)
    validate_email!(user.new_email)
    validate_and_confirm!(user.new_email_confirmation, code)
    ClaimTokenService.complete(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  # Unlike its siblings this confirms nothing on +user+: it hands +user+'s identity,
  # verification and participation to the account owning the confirmed address and
  # deletes +user+. The result carries the survivor, who the caller must become.
  def validate_and_confirm_merge_account!(user, code)
    validate_user!(user)
    validate_email!(user.merge_target_email)
    confirmation = user.merge_account_confirmation
    raise ValidationError.new(:code, :invalid) if confirmation.nil?

    validate_code!(confirmation, code)

    target = User.find_by_cimail(user.merge_target_email)
    return success_result(promote_merge_target_email!(user, confirmation)) if target.nil?

    success_result(AccountMergeService.new.merge!(source: user, target: target, proof: :email_code))
  rescue ValidationError => e
    failure_result(e)
  rescue AccountMergeService::IneligibleError
    # Never say which rule refused: that would be an oracle for which addresses
    # belong to admins.
    failure_result(ValidationError.new(:base, :merge_not_allowed))
  end

  def validate_and_confirm_phone!(user, code)
    # Ensure that password login (i.e. 'normal', non-SSO login)
    # feature is enabled for phone confirmation
    validate_password_login_enabled!
    validate_sms_enabled!
    validate_user!(user)
    validate_phone!(user.phone)
    validate_and_confirm!(user.phone_confirmation, code)
    ClaimTokenService.complete(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  # The phone mirror of validate_and_reconfirm_email!. The sms feature is still
  # required, since it carries the settings the code is sent through.
  def validate_and_reconfirm_phone!(user, code)
    validate_sms_enabled!
    validate_user!(user)
    validate_phone!(user.phone)
    validate_and_confirm!(user.phone_confirmation, code)
    ClaimTokenService.complete(user)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  # Confirms a pending phone-number change for an authenticated user.
  # On success, NewPhoneConfirmation#confirm! promotes new_phone -> phone.
  def validate_and_confirm_new_phone!(user, code)
    validate_user!(user)
    validate_phone!(user.new_phone)
    validate_and_confirm!(user.new_phone_confirmation, code)

    success_result(user)
  rescue ValidationError => e
    failure_result(e)
  end

  private

  def validate_and_confirm!(confirmation, code)
    raise ValidationError.new(:code, :invalid) if confirmation.nil?
    # An expired (or not yet issued) code is nil: nothing can match it, so bail out
    # before a submitted blank or nil code could be compared against it.
    raise ValidationError.new(:code, :expired) unless confirmation.code_outstanding?

    validate_code!(confirmation, code)
    confirm_user!(confirmation)
  end

  # The code checks without the confirm! that follows them elsewhere - the merge
  # flow's "confirm" is a multi-table operation, not a model method.
  def validate_code!(confirmation, code)
    validate_retry_count!(confirmation, code)
    validate_code_value!(confirmation, code)
    validate_code_expiration!(confirmation)
  end

  # Nobody owns the address any more, so there is nothing to merge into. The code
  # still proved the user reads that inbox, so it becomes their email, as a confirmed
  # new_email would.
  def promote_merge_target_email!(user, confirmation)
    ActiveRecord::Base.transaction do
      user.update!(
        email: user.merge_target_email,
        merge_target_email: nil,
        email_confirmed_at: Time.zone.now,
        confirmation_required: false
      )
      confirmation.destroy!
    end

    user
  end

  def validate_password_login_enabled!
    return if app_configuration.feature_activated?('password_login')

    raise ValidationError.new(:base, :password_login_feature_disabled)
  end

  def validate_sms_enabled!
    return if app_configuration.feature_activated?('sms')

    raise ValidationError.new(:base, :sms_feature_disabled)
  end

  def validate_user!(user)
    raise ValidationError.new(:user, :blank) if user.blank?
  end

  def validate_email!(email)
    raise ValidationError.new(:user, :no_email) if email.blank?
  end

  def validate_phone!(phone)
    raise ValidationError.new(:user, :no_phone) if phone.blank?
  end

  def validate_retry_count!(confirmation, code)
    return if confirmation.code == code # don't increment unless code is wrong

    confirmation.code_retry_count += 1
    return if confirmation.save

    raise ValidationError.new(:code, :too_many_retries)
  end

  def validate_code_value!(confirmation, code)
    raise ValidationError.new(:code, :blank) if code.blank?

    return if confirmation.code == code

    raise ValidationError.new(:code, :invalid)
  end

  def validate_code_expiration!(confirmation)
    # A code that was never sent (no code_sent_at, so no expiration_at) can't be confirmed.
    return if confirmation.expiration_at && confirmation.expiration_at >= Time.zone.now

    raise ValidationError.new(:code, :expired)
  end

  def validate_user_confirmation_required!(user)
    return if user.confirmation_required?

    raise ValidationError.new(:base, :confirmation_not_required)
  end

  def confirm_user!(confirmation)
    # Built before confirming: confirm! promotes new_email / new_phone and clears them.
    payload = confirmed_code_activity_payload(confirmation)

    unless confirmation.confirm!
      raise ValidationError.new(
        :user, :confirmation, message: 'Something went wrong.'
      )
    end

    user = confirmation.user
    LogActivityJob.perform_later(user, 'confirmed_confirmation_code', user, Time.now.to_i, payload: payload)
  end

  # The same payload as the requested_confirmation_code and received_confirmation_code
  # activities logged by the Request*ConfirmationCodeJobs.
  def confirmed_code_activity_payload(confirmation)
    case confirmation
    when EmailConfirmation then { new_email: nil }
    when NewEmailConfirmation then { new_email: confirmation.user.new_email }
    when PhoneConfirmation then { new_phone: nil }
    when NewPhoneConfirmation then { new_phone: confirmation.user.new_phone }
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
