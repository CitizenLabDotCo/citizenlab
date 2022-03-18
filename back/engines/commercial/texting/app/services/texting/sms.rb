require 'twilio-ruby'

class Texting::Sms
  class << self
    def send_msg(message, phone_number)
      client.messages.create(body: message, to: phone_number, from: from)
      true
    rescue Twilio::REST::TwilioError => e
      ErrorReporter.report(e, extra: { message: message, phone_number: phone_number })
      false
    end

    private

    # not sure it's thread safe https://github.com/twilio/twilio-ruby/issues/311
    def client
      # At the moment, messaging is supported only in the US
      # https://www.twilio.com/docs/global-infrastructure/regional-product-and-feature-availability
      # so we don't specify `region`
      Twilio::REST::Client.new(ENV['TWILIO_ACCOUNT_SID'], ENV['TWILIO_AUTH_TOKEN'])
    end

    def from
      ENV['TWILIO_PHONE_NUMBER']
    end
  end
end
