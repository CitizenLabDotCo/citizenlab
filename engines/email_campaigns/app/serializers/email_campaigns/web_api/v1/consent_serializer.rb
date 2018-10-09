module EmailCampaigns
  class WebApi::V1::ConsentSerializer < ActiveModel::Serializer
    attributes :id, :campaign_name, :campaign_type_description_multiloc, :consented, :created_at, :updated_at

    def campaign_name
      object.campaign_type.safe_constantize&.campaign_name
    end

    def campaign_type_description_multiloc
    	object.campaign_type.safe_constantize&.campaign_description_multiloc
    end
  end
end
