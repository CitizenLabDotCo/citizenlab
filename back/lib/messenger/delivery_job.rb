module Messenger
  class DeliveryJob < ApplicationJob
    def run(message)
      message.deliver
    end
  end
end
