module UserConfirmation
  class CheckConfirmationCode < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      fail! 'code.blank' if code.blank?
      fail! 'code.invalid' if user.confirmation_code != code
    end
  end
end
