# frozen_string_literal: true

module Texting
  class SideFxCampaignService < BaseSideFxService
    def after_send(campaign, user)
      LogActivityJob.perform_later(campaign, 'do_send', user, campaign.updated_at.to_i)
    end

    private

    def resource_name
      :texting_campaign
    end
  end
end
