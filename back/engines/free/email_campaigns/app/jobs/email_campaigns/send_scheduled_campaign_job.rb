# frozen_string_literal: true

module EmailCampaigns
  class SendScheduledCampaignJob < ApplicationJob
    queue_as :default
    self.maximum_retry_count = 2_000_000_000

    def run(campaign_id, expected_scheduled_at)
      campaign = Campaign.find(campaign_id)
      return unless campaign

      # Skip stale jobs from reschedules
      if expected_scheduled_at.present?
        expected_time = Time.zone.parse(expected_scheduled_at)
        return unless campaign.scheduled_at.present? && campaign.scheduled_at.to_i == expected_time.to_i
      end

      campaign.with_lock do
        campaign.clear_scheduled_at
        DeliveryService.new.send_now(campaign)
      end
      SideFxCampaignService.new.after_send(campaign, campaign.author)
    end
  end
end
