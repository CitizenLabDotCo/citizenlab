module EmailCampaigns
  class SideFxCampaignService
    include SideFxHelper

    def before_create campaign, user

    end

    def after_create campaign, user
      LogActivityJob.perform_later(campaign, 'created', user, campaign.created_at.to_i)
    end

    def before_update campaign, user
      
    end

    def after_update campaign, user
      LogActivityJob.perform_later(campaign, 'changed', user, campaign.updated_at.to_i)
    end

    def before_send campaign, user
      
    end

    def after_send campaign, user
      LogActivityJob.perform_later(campaign, 'sent', user, campaign.updated_at.to_i)
    end

    def before_destroy campaign, user

    end

    def after_destroy frozen_campaign, user
      serialized_campaign = clean_time_attributes(frozen_campaign.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_campaign), 'deleted', user, Time.now.to_i, payload: {campaign: serialized_campaign})
    end

  end
end