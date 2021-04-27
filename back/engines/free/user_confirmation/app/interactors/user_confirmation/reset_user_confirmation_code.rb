module UserConfirmation
  class ResetUserConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      validate_code
      validate_confirmation_reset_count
    end

    def validate_code
      unless user.reset_confirmation_code && user.valid_attribute?(:email_confirmation_code)
        fail_with_error! :code, :invalid, message: 'The code is invalid.'
      end
    end

    def validate_confirmation_reset_count
      unless user.increment_confirmation_code_reset_count!
        fail_with_error! :code, :too_many_resets, message: 'You\'ve reset too many times.'
      end
    end
  end
end
