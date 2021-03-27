module EmailCampaigns
  class TriggerOnScheduleJob < ApplicationJob
    queue_as :default

    def run timestamp
      time = Time.at(timestamp)
      service = DeliveryService.new
      service.send_on_schedule(time)
    end

  end
end
