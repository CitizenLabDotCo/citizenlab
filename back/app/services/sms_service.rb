require 'twilio-ruby'

class SmsService
  def send_sms(phone_number, body)
    twilio_client.api.v2010.messages.create(
      from: ENV.fetch('TWILIO_PHONE_NUMBER'),
      to: phone_number,
      body: body
    )
  end

  private

  def twilio_client
    @twilio_client ||= Twilio::REST::Client.new(
      ENV.fetch('TWILIO_ACCOUNT_SID'),
      ENV.fetch('TWILIO_AUTH_TOKEN')
    )
  end
end
