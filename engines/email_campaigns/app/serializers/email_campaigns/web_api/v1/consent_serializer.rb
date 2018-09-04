module EmailCampaigns
  class WebApi::V1::ConsentSerializer < ActiveModel::Serializer
    attributes :id, :campaign_name, :campaign_type_description_multiloc, :consented, :created_at, :updated_at

    def campaign_name
    	object.campaign_type.safe_constantize&.campaign_name
    end

    def campaign_type_description_multiloc
      # TODO campaign_name might be nil if deleted campaign
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc(
        "email_campaigns.campaign_type_description.#{campaign_name}"
      )
    end
  end
end
