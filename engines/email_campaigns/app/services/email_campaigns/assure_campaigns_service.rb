module EmailCampaigns
  class AssureCampaignsService

    def assure_campaigns
      instantiatable_campaign_types = (EmailCampaigns::DeliveryService.new.campaign_types - ["EmailCampaigns::Campaigns::Manual"])

      type_counts = Campaign
        .where(type: instantiatable_campaign_types)
        .group(:type).count

      instantiatable_campaign_types.each do |type|
        unless type_counts[type]
          claz = type.constantize
          claz.create!
        end
      end
    end

  end
end