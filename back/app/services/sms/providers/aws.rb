module Sms
  module Providers
    class Aws < Base
      def send(to:, body:)
        response = client.send_text_message(
          destination_phone_number: to,
          origination_identity: ENV.fetch('AWS_SMS_ORIGINATION_IDENTITY'),
          message_body: body,
          message_type: 'TRANSACTIONAL'
        )
        { message_sid: response.message_id, status: 'queued' }
      rescue ::Aws::PinpointSMSVoiceV2::Errors::ServiceError => e
        raise Error, e.message
      end

      private

      def client
        @client ||= ::Aws::PinpointSMSVoiceV2::Client.new(region: ENV.fetch('AWS_SMS_REGION'))
      end
    end
  end
end
