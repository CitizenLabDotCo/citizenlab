# frozen_string_literal: true

module EmailCampaigns
  class SendScheduledCampaignJob < ApplicationJob
    queue_as :default
    perform_retries false

    def run(campaign_id, expected_scheduled_at = nil)
      campaign = Campaign.find_by(id: campaign_id)
      return unless campaign

      # Skip stale jobs from reschedules
      if expected_scheduled_at.present?
        expected_time = Time.zone.parse(expected_scheduled_at)
        return unless campaign.scheduled_at.present? && campaign.scheduled_at.to_i == expected_time.to_i
      end

      DeliveryService.new.send_on_schedule_for(campaign)
      campaign.clear_scheduled_at
      SideFxCampaignService.new.after_send(campaign, campaign.author)
    end
  end
end
