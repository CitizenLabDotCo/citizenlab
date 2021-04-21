module UserConfirmation
  class ConfirmUser < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      validate_user
      validate_code
      confirm_user
    end

    def validate_user
      fail_with_error! :user, :blank   if user.blank?
    end

    def validate_code
      fail_with_error! :code, :blank   if code.blank?
      fail_with_error! :code, :invalid if user.email_confirmation_code != code
    end

    def confirm_user
      fail_with_error! :user, :confirmation, message: 'Something went wrong.' unless user.confirm!
    end
  end
end
