module EmailCampaigns
  class TriggerOnActivityJob < ApplicationJob
    queue_as :default
  
    def perform activity
      service = DeliveryService.new
      service.send_on_activity(activity)
    end

  end
end
