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
        rescue ::Twilio::REST::RestError => e
          # Translate the HTTP status into one of our provider error classes so
          # callers (Sms::SendJob, Sms::SendService) can decide whether to retry.
          raise error_for(e)
        rescue ::Twilio::REST::TwilioError => e
          # Non-HTTP failures (e.g. connection errors) carry no status code and
          # are treated as permanent.
          raise ProviderError, e.message
        end

        def verify_signature(request)
          validator = ::Twilio::Security::RequestValidator.new(config['twilio_auth_token'])
          signature = request.headers['X-Twilio-Signature']
          validator.validate(callback_url, request.request_parameters, signature)
        end

        def parse_callback(params)
          {
            message_sid: params[:MessageSid],
            status: STATUS_MAPPING[params[:MessageStatus]],
            # The provider's original status string, kept for diagnostics when it
            # maps to nil (a status we don't track).
            raw_status: params[:MessageStatus]
          }
        end

        private

        # Maps a Twilio REST error onto our provider error hierarchy by HTTP
        # status: 429 -> RateLimit, 503 -> ServiceUnavailable, other 5xx ->
        # ServerError (all retryable), anything else -> the permanent ProviderError.
        def error_for(rest_error)
          error_class_for(rest_error.status_code).new(rest_error.message)
        end

        def error_class_for(status_code)
          case status_code
          when 429 then ProviderError::RateLimit
          when 503 then ProviderError::ServiceUnavailable
          when 500..599 then ProviderError::ServerError
          else ProviderError
          end
        end

        def callback_url
          "#{AppConfiguration.instance.base_backend_uri}/hooks/sms/events"
        end

        # SMS is always sent through a Twilio Messaging Service, identified by its SID.
        def from_params
          messaging_service_sid = config['twilio_messaging_service_sid'].presence
          raise Error, 'No Twilio messaging service SID configured' unless messaging_service_sid

          { messaging_service_sid: messaging_service_sid }
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
