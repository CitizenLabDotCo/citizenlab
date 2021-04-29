module UserConfirmation
  class ConfirmUser < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      validate_user
      validate_code_expiration
      validate_code_value
      validate_retry_count
      confirm_user
    end

    def validate_user
      return unless user.blank?

      fail_with_error! :user, :blank
    end

    def validate_code_expiration
      return unless user.email_confirmation_code_expiration_at < Time.zone.now

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
  end
end
