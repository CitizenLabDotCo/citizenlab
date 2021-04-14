module UserConfirmation
  class SendConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      if user.signed_up_with_email?
        EmailConfirmationsMailer.with(user: user).send_confirmation_code.deliver_later
      elsif user.signed_up_with_phone?
        PhoneConfirmationsMessenger.with(user: user).send_confirmation_code.deliver_later
      end
    end
  end
end
