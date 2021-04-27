module UserConfirmation
  class ResetUserConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      fail_with_error! :code, :invalid, message: 'The code is invalid.' unless user.reset_confirmation_code && user.valid_attribute?(user.email_confirmation_code)
      fail_with_error! :code, :too_many_resets, message: 'You\'ve reset too many times.' unless user.increment_confirmation_code_reset_count!
    end
  end
end
