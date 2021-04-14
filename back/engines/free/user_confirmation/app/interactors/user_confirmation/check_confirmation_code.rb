module UserConfirmation
  class CheckConfirmationCode < ApplicationInteractor
    delegate :user, :code, to: :context

    def call
      fail! error: 'user.blank' if user.blank?
      fail! error: 'code.blank' if code.blank?
      fail! error: 'code.invalid' if user.confirmation_code != code
    end
  end
end
