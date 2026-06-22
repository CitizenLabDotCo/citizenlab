# frozen_string_literal: true

module Sms
  class SendJob < ApplicationJob
    def run(delivery_id)
      delivery = Sms::Delivery.find(delivery_id)
      Sms::Sender.new.deliver(delivery)
    end
  end
end
