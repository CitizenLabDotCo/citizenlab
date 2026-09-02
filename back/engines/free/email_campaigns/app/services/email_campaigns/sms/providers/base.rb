# frozen_string_literal: true

module EmailCampaigns
  module Sms
    module Providers
      class Base
        # @param to [String] phone number in E.164 format
        # @param body [String] message body
        # @param use_case [String] the stream this message belongs to (one of UseCase::ALL),
        #   which the provider maps onto its own sender configuration
        # @return [Hash{Symbol => String}] { message_sid:, status: }
        # @raise [Error] when the underlying provider rejects the message
        def send(to:, body:, use_case:)
          raise NotImplementedError
        end

        # Whether the provider holds everything it needs to send on this use case, so
        # callers can refuse a send before creating any delivery.
        # @param use_case [String] one of UseCase::ALL
        # @return [Boolean]
        def configured?(use_case)
          raise NotImplementedError
        end

        # @param request [ActionDispatch::Request] the inbound callback request
        # @return [Boolean] whether the request genuinely originates from the provider
        def verify_signature(request)
          raise NotImplementedError
        end

        # Normalises a provider callback into our own vocabulary.
        # @param params [ActionController::Parameters] the callback params
        # @return [Hash] { message_sid:, status:, raw_status:, opted_out: }
        #   where status is one of Delivery::STATUSES (nil if the event is unmapped),
        #   raw_status is the provider's original status string (for diagnostics) and
        #   opted_out says whether the message was refused because the recipient
        #   replied STOP
        def parse_callback(params)
          raise NotImplementedError
        end
      end
    end
  end
end
