# frozen_string_literal: true

module EmailCampaigns
  module Sms
    module Providers
      class Base
        # @param to [String] phone number in E.164 format
        # @param body [String] message body
        # @param use_case [String] the stream this message belongs to (one of UseCase::ALL),
        #   which the provider maps onto its own sender configuration
        # @return [Hash{Symbol => String, Integer, nil}] { message_sid:, status:, segments_count: }
        # @raise [Error] when the underlying provider rejects the message
        def send(to:, body:, use_case:)
          raise NotImplementedError
        end

        # @param message_sid [String] the provider's id for an already-sent message
        # @return [Integer, nil] the number of segments the message was billed as
        # @raise [Error] when the provider can't be reached or doesn't know the message
        def fetch_segments_count(message_sid)
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
