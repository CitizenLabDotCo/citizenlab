module UserConfirmation
  class ConfirmUser < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      validate_user
      validate_code
      confirm_user
    end

    def validate_user
      fail_with_error! :user, :blank if user.blank?
    end

    def validate_code
      fail_with_error! :code, :blank if code.blank?
      return unless user.email_confirmation_code != code

      fail_with_error! :code, :too_many_retries unless user.increment_email_confirmation_retry_count!

      fail_with_error! :code, :invalid
    end

    def handle_invalid_code
      fail_with_error! :code, :invalid
    end

    def confirm_user
      fail_with_error! :user, :confirmation, message: 'Something went wrong.' unless user.confirm!
    end
  end
end
