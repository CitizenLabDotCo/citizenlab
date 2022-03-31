module Texting
  class SideFxCampaignService < BaseSideFxService

    def after_send(campaign, user)
      LogActivityJob.perform_later(campaign, 'sent', user, campaign.updated_at.to_i)
    end

    private

    def resource_name
      :texting_campaign
    end
  end
end
