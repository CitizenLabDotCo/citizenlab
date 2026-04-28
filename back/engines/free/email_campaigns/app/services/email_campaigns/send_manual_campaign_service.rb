# frozen_string_literal: true

module EmailCampaigns
  class SendManualCampaignService
    def call(campaign, user)
      # The sent? check must happen inside with_lock to prevent race conditions.
      # CampaignPolicy#update? also checks sent?, but that runs before the lock
      # is acquired, so concurrent requests can both pass the policy check while
      # deliveries from the first request are still uncommitted.
      campaign.with_lock do
        if campaign.sent?
          campaign.errors.add(:base, :already_sent, message: 'This campaign has already been sent')
          false
        else
          campaign.clear_scheduled_at!
          DeliveryService.new.send_now(campaign)
          SideFxCampaignService.new.after_send(campaign, user)
          true
        end
      end
    end
  end
end
