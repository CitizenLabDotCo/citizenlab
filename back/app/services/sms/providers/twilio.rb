module Sms
  module Providers
    class Twilio < Base
      # Twilio MessageStatus values -> Sms::Delivery statuses.
      # https://www.twilio.com/docs/messaging/api/message-resource#message-status-values
      STATUS_MAPPING = {
        'accepted' => 'queued',
        'queued' => 'queued',
        'sending' => 'queued',
        'sent' => 'sent',
        'delivered' => 'delivered',
        'undelivered' => 'undelivered',
        'failed' => 'failed'
      }.freeze

      def send(to:, body:)
        message = client.api.v2010.messages.create(
          from: ENV.fetch('TWILIO_PHONE_NUMBER'),
          to: to,
          body: body,
          status_callback: callback_url
        )
        # The create response status is normally `queued` (or `accepted`); fall
        # back to `queued` for any status we don't explicitly map so the delivery
        # never lands on a non-vocabulary value.
        { message_sid: message.sid, status: STATUS_MAPPING.fetch(message.status, 'queued') }
      rescue ::Twilio::REST::RestError => e
        raise Error, e.message
      end

      def verify_signature(request)
        validator = ::Twilio::Security::RequestValidator.new(ENV.fetch('TWILIO_AUTH_TOKEN'))
        signature = request.headers['X-Twilio-Signature']
        validator.validate(callback_url, request.request_parameters, signature)
      end

      def callback_url
        "#{AppConfiguration.instance.base_backend_uri}/web_api/v1/sms/callbacks/twilio"
      end

      def parse_callback(params)
        {
          message_sid: params[:MessageSid],
          status: STATUS_MAPPING[params[:MessageStatus]]
        }
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
