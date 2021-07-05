module UserConfirmation
  class ConfirmUser < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      validate_user
      validate_code_sent
      validate_code_expiration
      validate_code_value
      validate_retry_count
      complete_registration_without_custom_fields
      confirm_user
    end

    def validate_user
      return unless user.blank?

      fail_with_error! :user, :blank
    end

    def validate_code_sent
      return if user.email_confirmation_code_sent_at

      fail_with_error! :code, :not_sent
    end

    def validate_code_expiration
      return if user.email_confirmation_code_expiration_at >= Time.zone.now

      fail_with_error! :code, :expired
    end

    def validate_retry_count
      return if user.increment_confirmation_retry_count!

      fail_with_error! :code, :too_many_retries
    end

    def validate_code_value
      fail_with_error! :code, :blank if code.blank?

      return if user.email_confirmation_code == code

      fail_with_error! :code, :invalid
    end

    def confirm_user
      return if user.confirm!

      fail_with_error! :user, :confirmation, message: 'Something went wrong.'
    end

    def complete_registration_without_custom_fields
      if (CustomField.with_resource_type('User').enabled.count == 0) && (user.invite_status != 'pending')
        user.registration_completed_at ||= Time.now
      end
    end
  end
end
