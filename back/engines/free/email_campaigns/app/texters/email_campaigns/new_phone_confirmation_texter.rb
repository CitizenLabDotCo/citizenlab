# frozen_string_literal: true

module EmailCampaigns
  # Texter for the phone-confirmation OTP. The body is a localized template with
  # the verification code interpolated — no admin-authored content and no mailer,
  # so this is the SMS equivalent of a transactional mailer rendering its own body.
  #
  # It targets the *pending* new_phone_number being verified, not the confirmed
  # phone_number (which may still be blank until confirmation completes).
  class NewPhoneConfirmationTexter < ApplicationTexter
    def body
      I18n.t(
        'email_campaigns.new_phone_confirmation.sms_body',
        code: command.dig(:event_payload, :code),
        locale: recipient.locale
      )
    end

    def destination
      recipient.new_phone_number
    end
  end
end
