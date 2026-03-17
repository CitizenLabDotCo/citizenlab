# frozen_string_literal: true

module EmailCampaigns
  class SendScheduledCampaignJob < ApplicationJob
    queue_as :default

    def run(campaign_id, expected_scheduled_at)
      campaign = Campaign.find_by(id: campaign_id)
      return unless campaign

      # Skip stale jobs from reschedules
      if expected_scheduled_at.present?
        expected_time = expected_scheduled_at
        return unless campaign.scheduled_at.present? && campaign.scheduled_at == expected_time
      end

      campaign.with_lock do
        campaign.clear_scheduled_at!
        DeliveryService.new.send_now(campaign)
      end
      SideFxCampaignService.new.after_send(campaign, campaign.author)
    end
  end
end
