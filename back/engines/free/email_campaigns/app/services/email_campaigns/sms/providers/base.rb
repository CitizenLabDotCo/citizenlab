# frozen_string_literal: true

module EmailCampaigns
  module Sms
    module Providers
      class Base
        # @param to [String] phone number in E.164 format
        # @param body [String] message body
        # @return [Hash{Symbol => String}] { message_sid:, status: }
        # @raise [Error] when the underlying provider rejects the message
        def send(to:, body:)
          raise NotImplementedError
        end

        # Reads back what a message actually cost. The provider, not us, is the source of
        # truth for this: the segment count and price are only settled once the message
        # has been handed to a carrier.
        # @param message_sid [String] the provider's identifier for the message
        # @return [Hash{Symbol => Integer, BigDecimal, String, nil}]
        #   { num_segments:, price:, price_unit: } -- price and price_unit may be nil when
        #   the provider has not billed the message yet
        # @raise [Error] when the message cannot be read
        def fetch_message(message_sid)
          raise NotImplementedError
        end

        # @param request [ActionDispatch::Request] the inbound callback request
        # @return [Boolean] whether the request genuinely originates from the provider
        def verify_signature(request)
          raise NotImplementedError
        end

        # Normalises a provider callback into our own vocabulary.
        # @param params [ActionController::Parameters] the callback params
        # @return [Hash{Symbol => String, nil}] { message_sid:, status:, raw_status: }
        #   where status is one of Delivery::STATUSES (nil if the event is unmapped)
        #   and raw_status is the provider's original status string (for diagnostics)
        def parse_callback(params)
          raise NotImplementedError
        end
      end
    end
  end
end
