# frozen_string_literal: true

module EmailCampaigns
  class SendScheduledCampaignJob < ApplicationJob
    queue_as :default

    def run(campaign_id, expected_scheduled_at)
      campaign = Campaign.find_by(id: campaign_id)
      return unless campaign

      # Skip stale jobs from reschedules
      return if expected_scheduled_at.blank? ||
                campaign.scheduled_at.blank? ||
                campaign.scheduled_at != expected_scheduled_at

      campaign.with_lock do
        campaign.clear_scheduled_at!
        DeliveryService.new.send_now(campaign)
      end
      SideFxCampaignService.new.after_send(campaign, campaign.author)
    end
  end
end
