# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendJob < ApplicationJob
      def run(delivery_id)
        delivery = Delivery.find(delivery_id)
        SendService.new.deliver(delivery, to: delivery.user&.phone_number)
      end

      # Only rate-limit errors are transient and worth retrying (Que applies its
      # own backoff via `super`). Every other failure is permanent, so expire the
      # job immediately instead of burning through retries.
      def handle_error(error)
        error.is_a?(Error::RateLimit) ? super : expire
      end
    end
  end
end
