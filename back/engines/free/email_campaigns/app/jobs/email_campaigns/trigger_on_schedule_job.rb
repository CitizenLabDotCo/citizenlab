# frozen_string_literal: true

module EmailCampaigns
  class TriggerOnScheduleJob < ApplicationJob
    queue_as :default
    perform_retries false # prevent spamming users in case of exception

    def run(timestamp)
      time = Time.at(timestamp)
      service = DeliveryService.new
      service.send_on_schedule(time)
    end
  end
end
