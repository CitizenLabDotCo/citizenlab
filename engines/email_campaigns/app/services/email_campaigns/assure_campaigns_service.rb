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

    def remove_deprecated_campaigns
      supported_campaigns = EmailCampaigns::DeliveryService.new.campaign_types
      unsupported_ids     = EmailCampaigns::Campaign.where.not(type: supported_campaigns).pluck(:id)

      ActiveRecord::Base.transaction do
        # destroying unused groups
        EmailCampaigns::CampaignsGroup.where(campaign_id: unsupported_ids).destroy_all

        # nullifying foreign keys
        EmailCampaigns::Delivery.where(campaign_id: unsupported_ids).update_all(campaign_id: nil)

        # destroying images
        TextImage.where(imageable_type: 'EmailCampaigns::Campaign', imageable_id: unsupported_ids).destroy_all

        # deleting campaigns
        EmailCampaigns::Campaign.where(id: unsupported_ids).delete_all
      end
    end
  end
end
