# frozen_string_literal: true

module EmailCampaigns
  class SideFxCampaignService < BaseSideFxService
    include SideFxHelper

    def before_create(campaign, user); end

    def before_update(campaign, user); end

    def before_send(campaign, user); end

    def after_send(campaign, user)
      LogActivityJob.perform_later(campaign, 'sent', user, campaign.updated_at.to_i)
    end

    def before_destroy(campaign, user); end

    private

    def resource_name
      :campaign
    end
  end
end
