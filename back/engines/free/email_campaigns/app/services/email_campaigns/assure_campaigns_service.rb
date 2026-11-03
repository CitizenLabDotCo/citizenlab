# frozen_string_literal: true

module EmailCampaigns
  class AssureCampaignsService
    def assure_campaigns
      instantiatable_campaign_types = (
        delivery_service.campaign_types - delivery_service.manual_campaign_types
      )

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
      # Deliberately the feature-independent list: a campaign whose feature is switched
      # off is dormant, not deprecated. Only types that no longer exist in the codebase
      # are removed here.
      supported_campaigns = delivery_service.all_campaign_types
      unsupported_ids     = EmailCampaigns::Campaign.where.not(type: supported_campaigns).pluck(:id)

      # This makes it possible to temporarily load the records without STI errors
      EmailCampaigns::Campaign.class_eval { self.inheritance_column = :_type_disabled }

      begin
        ActiveRecord::Base.transaction do
          # These have to be deleted manually since EmailCampaigns::Campaign
          # does not have Trackable and RecipientConfigurable included.

          EmailCampaigns::CampaignsGroup.where(campaign_id: unsupported_ids).destroy_all
          EmailCampaigns::Delivery.where(campaign_id: unsupported_ids).destroy_all
          # Likewise: `dependent: :nullify` is declared on Campaigns::BaseSms, which the
          # disabled inheritance column above puts out of reach. Unlinking rather than
          # deleting keeps the delivery record, matching what that association intends.
          EmailCampaigns::Sms::Delivery.where(campaign_id: unsupported_ids).update_all(campaign_id: nil)
          EmailCampaigns::Campaign.where(id: unsupported_ids).destroy_all
          # We don't delete the user consents because we may be legally required to do so.
        end
      ensure
        # Make everything back to normal. In an `ensure` because otherwise a failure above
        # leaves STI disabled on Campaign for the rest of the process.
        EmailCampaigns::Campaign.class_eval { self.inheritance_column = :type }
      end
    end

    private

    def delivery_service
      @delivery_service ||= EmailCampaigns::DeliveryService.new
    end
  end
end
