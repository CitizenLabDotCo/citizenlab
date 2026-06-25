# frozen_string_literal: true

module EmailCampaigns
  module Sms
    module Providers
      class Twilio < Base
        # Twilio MessageStatus values -> Delivery statuses.
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
            **from_params,
            to: to,
            body: body,
            status_callback: callback_url
          )
          # The create response status is normally `queued` (or `accepted`); fall
          # back to `queued` for any status we don't explicitly map so the delivery
          # never lands on a non-vocabulary value.
          { message_sid: message.sid, status: STATUS_MAPPING.fetch(message.status, 'queued') }
        rescue ::Twilio::REST::TwilioError => e
          raise Error, e.message
        end

        def verify_signature(request)
          validator = ::Twilio::Security::RequestValidator.new(config['twilio_auth_token'])
          signature = request.headers['X-Twilio-Signature']
          validator.validate(callback_url, request.request_parameters, signature)
        end

        def parse_callback(params)
          {
            message_sid: params[:MessageSid],
            status: STATUS_MAPPING[params[:MessageStatus]]
          }
        end

        private

        def callback_url
          "#{AppConfiguration.instance.base_backend_uri}/web_api/v1/sms/callbacks/twilio"
        end

        # The Messaging Service SID takes precedence over the phone number when
        # both are configured. At least one must be set.
        def from_params
          messaging_service_sid = config['twilio_messaging_service_sid'].presence
          return { messaging_service_sid: messaging_service_sid } if messaging_service_sid

          phone_number = config['twilio_phone_number'].presence
          raise Error, 'No Twilio sender configured (set a phone number or messaging service SID)' unless phone_number

          { from: phone_number }
        end

        def client
          @client ||= ::Twilio::REST::Client.new(
            config['twilio_account_sid'],
            config['twilio_auth_token']
          )
        end

        def config
          AppConfiguration.instance.settings('sms') || {}
        end
      end
    end
  end
end
