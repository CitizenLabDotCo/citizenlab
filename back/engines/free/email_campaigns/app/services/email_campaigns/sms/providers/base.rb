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
