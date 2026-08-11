# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class FetchSegmentsJob < ApplicationJob
      def run(delivery_id)
        delivery = Delivery.find(delivery_id)
        SendService.new.fetch_segments_count(delivery)
      end

      def handle_error(error)
        case error
        when *ProviderError::RETRYABLE_ERRORS
          super
        else
          expire
        end
      end
    end
  end
end
