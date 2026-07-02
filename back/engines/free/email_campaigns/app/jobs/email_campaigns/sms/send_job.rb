# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class SendJob < ApplicationJob
      def run(delivery_id)
        delivery = Delivery.find(delivery_id)
        SendService.new.deliver(delivery, to: delivery.user&.phone_number)
      end
    end
  end
end
