# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendJob < ApplicationJob
      def run(delivery_id)
        delivery = Delivery.find(delivery_id)
        SendService.new.deliver(delivery, to: delivery.user&.phone)
      end

      def handle_error(error)
        case error
        when *ProviderError::RETRYABLE_ERRORS then super
        else expire
        end
      end
    end
  end
end
