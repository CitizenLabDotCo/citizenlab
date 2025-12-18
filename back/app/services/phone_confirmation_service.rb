# frozen_string_literal: true

require 'twilio-ruby'

account_sid = ENV.fetch('TWILIO_ACCOUNT_SID')
auth_token = ENV.fetch('TWILIO_AUTH_TOKEN')
from_phone_number = ENV.fetch('TWILIO_PHONE_NUMBER')

class PhoneConfirmationService
  def send_confirmation_code(phone_number, code)
    twilio_client
      .api
      .v2010
      .messages
      .create(
        body: "Your confirmation code is #{code}",
        from: from_phone_number,
        to: phone_number
      )
  end

  private

  def twilio_client
    @twilio_client ||= Twilio::REST::Client.new(account_sid, auth_token)
  end
end
