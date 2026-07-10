# frozen_string_literal: true

module EmailCampaigns
  module Sms
    # Reads back from the provider what a message actually cost, once the delivery has
    # reached a terminal status. The provider, not us, is the source of truth here: the
    # segment count is only settled once a sender has been assigned, and the price only
    # once the message has been handed to a carrier.
    #
    # Enqueued by the status-callback controller, because no provider callback carries
    # this information -- Twilio's outbound status callback has no NumSegments or Price
    # parameter, so it has to be fetched.
    class FetchMessageJob < ApplicationJob
      # A Messaging Service picks a sender and analyses the message *after* the send call
      # returns, and only then are the segment count and price populated. Twilio therefore
      # recommends waiting 10-30 seconds after sending before reading a message back:
      # https://support.twilio.com/hc/en-us/articles/360034857114
      SETTLE_DELAY = 60.seconds

      def run(delivery_id)
        delivery = Delivery.find(delivery_id)
        return if delivery.message_sid.blank?

        message = provider.fetch_message(delivery.message_sid)

        delivery.update!(
          num_segments: message[:num_segments],
          price: message[:price],
          price_unit: message[:price_unit]
        )
      end

      def handle_error(error)
        case error
        when *ProviderError::RETRYABLE_ERRORS
          super
        else
          expire
        end
      end

      private

      def provider
        Providers::Twilio.new
      end
    end
  end
end
