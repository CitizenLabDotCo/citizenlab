module UserConfirmation
  class SendConfirmationCode < ApplicationInteractor
    delegate :user, to: :context

    def call
      if user.signed_up_with_email?
        EmailVerificationsMailer.with(user: user).send_verification_code.deliver_later
      elsif user.signed_up_with_phone?
        PhoneVerificationsMessenger.with(user: user).send_verification_code.deliver_later
      end
    end
  end
end
