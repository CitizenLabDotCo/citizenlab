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

    ## Removes the DB records of removed STI classes
    def remove_deprecated_campaigns
      supported_campaigns = EmailCampaigns::DeliveryService.new.campaign_types
      unsupported_ids     = EmailCampaigns::Campaign.where.not(type: supported_campaigns).pluck(:id)

      # This makes it possible to temporarily load the records without STI errors
      EmailCampaigns::Campaign.class_eval { self.inheritance_column = :_type_disabled }

      ActiveRecord::Base.transaction do
        # These have to be deleted manually since EmailCampaigns::Campaign
        # does not have Trackable and RecipientConfigurable included.

        EmailCampaigns::CampaignsGroup.where(campaign_id: unsupported_ids).destroy_all
        EmailCampaigns::Delivery.where(campaign_id: unsupported_ids).destroy_all
        EmailCampaigns::Campaign.where(id: unsupported_ids).destroy_all
      end

      # Make everything back to normal
      EmailCampaigns::Campaign.class_eval { self.inheritance_column = :type }
    end
  end
end
