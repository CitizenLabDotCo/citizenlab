# frozen_string_literal: true

module Sms
  class SendJob < ApplicationJob
    def run(delivery_id, provider: Sms::Sender::DEFAULT_PROVIDER)
      delivery = Sms::Delivery.find(delivery_id)
      Sms::Sender.new.deliver(delivery, provider: provider)
    end
  end
end
