# frozen_string_literal: true

module EmailCampaigns
  class TriggerOnActivityJob < ApplicationJob
    queue_as :default
    perform_retries false # prevent spamming users in case of exception

    def run(activity)
      service = DeliveryService.new
      service.send_on_activity(activity)
    end
  end
end
