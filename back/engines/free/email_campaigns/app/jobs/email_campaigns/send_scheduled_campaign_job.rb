# frozen_string_literal: true

module EmailCampaigns
  class SendScheduledCampaignJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run(campaign_id)
      campaign = Campaign.find_by(id: campaign_id)
      return unless campaign

      DeliveryService.new.send_on_schedule_for(campaign)
    end
  end
end
