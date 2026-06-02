module Sms
  module Providers
    class Twilio < Base
      def send(to:, body:)
        message = client.api.v2010.messages.create(
          from: ENV.fetch('TWILIO_PHONE_NUMBER'),
          to: to,
          body: body
        )
        { message_sid: message.sid, status: message.status }
      rescue ::Twilio::REST::RestError => e
        raise Error, e.message
      end

      private

      def client
        @client ||= ::Twilio::REST::Client.new(
          ENV.fetch('TWILIO_ACCOUNT_SID'),
          ENV.fetch('TWILIO_AUTH_TOKEN')
        )
      end
    end
  end
end
