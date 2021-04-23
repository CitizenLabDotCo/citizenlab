module UserConfirmation
  class SendConfirmationCodeToUser < ApplicationInteractor
    delegate :user, to: :context

    def call
      unless user.registered_with_email?
        fail_with_error! :registration_method, :invalid, message: 'Confirmation is currently working for emails only.'
      end

      ConfirmationsMailer.with(user: user).send_confirmation_code.deliver_later
    end
  end
end
