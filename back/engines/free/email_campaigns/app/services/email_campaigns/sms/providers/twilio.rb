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

        # Returned when the number replied STOP to the messaging service we're sending on.
        # https://www.twilio.com/docs/api/errors/21610
        OPTED_OUT_ERROR_CODE = 21_610

        # Each use case's messaging service SID lives in the feature that owns that use case.
        MESSAGING_SERVICE_SID_SETTINGS = {
          UseCase::MANUAL_CAMPAIGNS => %w[sms_manual_campaigns twilio_manual_campaigns_messaging_service_sid],
          UseCase::CONFIRMATION_CODES => %w[sms twilio_confirmation_codes_messaging_service_sid]
        }.freeze

        def send(to:, body:, use_case:)
          check_configuration!(use_case)

          message = client.api.v2010.messages.create(
            messaging_service_sid: messaging_service_sid(use_case),
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

        def configured?(use_case)
          missing_settings(use_case).empty?
        end

        def verify_signature(request)
          validator = ::Twilio::Security::RequestValidator.new(auth_token)
          signature = request.headers['X-Twilio-Signature']
          validator.validate(callback_url, request.request_parameters, signature)
        end

        def parse_callback(params)
          {
            message_sid: params[:MessageSid],
            status: STATUS_MAPPING[params[:MessageStatus]],
            # The provider's original status string, kept for diagnostics when it
            # maps to nil (a status we don't track).
            raw_status: params[:MessageStatus],
            opted_out: params[:ErrorCode].to_i == OPTED_OUT_ERROR_CODE
          }
        end

        private

        # Maps a Twilio REST error onto our provider error hierarchy. An opt-out is
        # recognised by its Twilio error code; everything else goes by HTTP status:
        # 429 -> RateLimit, 503 -> ServiceUnavailable, other 5xx -> ServerError (all
        # retryable), anything else -> the permanent ProviderError.
        def error_for(rest_error)
          return ProviderError::RecipientOptedOut.new(rest_error.message) if rest_error.code == OPTED_OUT_ERROR_CODE

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

        def missing_settings(use_case)
          {
            'account SID' => account_sid,
            'auth token' => auth_token,
            "#{use_case} messaging service SID" => messaging_service_sid(use_case)
          }.select { |_name, value| value.blank? }.keys
        end

        # The backstop for a send that was enqueued while the tenant was configured and
        # runs after it no longer is. Error, not ProviderError: the fault is ours.
        def check_configuration!(use_case)
          missing = missing_settings(use_case)
          raise Error, "Twilio is not configured for #{use_case}: missing #{missing.join(', ')}" if missing.any?
        end

        def messaging_service_sid(use_case)
          AppConfiguration.instance.settings(*MESSAGING_SERVICE_SID_SETTINGS.fetch(use_case))
        end

        def client
          @client ||= ::Twilio::REST::Client.new(account_sid, auth_token)
        end

        def account_sid
          config['twilio_account_sid']
        end

        def auth_token
          config['twilio_auth_token']
        end

        def config
          AppConfiguration.instance.settings('sms') || {}
        end
      end
    end
  end
end
