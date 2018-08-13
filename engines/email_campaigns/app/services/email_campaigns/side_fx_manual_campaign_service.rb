module EmailCampaigns
  class SideFxManualCampaignService
    include SideFxHelper

    def before_create manual_campaign, user

    end

    def after_create manual_campaign, user
      LogActivityJob.perform_later(manual_campaign, 'created', user, manual_campaign.created_at.to_i)
    end

    def before_update manual_campaign, user
      
    end

    def after_update manual_campaign, user
      LogActivityJob.perform_later(manual_campaign, 'changed', user, manual_campaign.updated_at.to_i)
    end

    def before_send manual_campaign, user
      
    end

    def after_send manual_campaign, user
      LogActivityJob.perform_later(manual_campaign, 'sent', user, manual_campaign.updated_at.to_i)
    end

    def before_destroy manual_campaign, user

    end

    def after_destroy frozen_manual_campaign, user
      serialized_manual_campaign = clean_time_attributes(frozen_manual_campaign.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_manual_campaign), 'deleted', user, Time.now.to_i, payload: {manual_campaign: serialized_manual_campaign})
    end

  end
end