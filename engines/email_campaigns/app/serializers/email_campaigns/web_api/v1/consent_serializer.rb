module EmailCampaigns
  class WebApi::V1::ConsentSerializer < ActiveModel::Serializer
    attributes :id, :campaign_type, :campaign_type_description_multiloc, :consented, :created_at, :updated_at

    def campaign_type_description_multiloc
      @multiloc_service ||= MultilocService.new
      @multiloc_service.i18n_to_multiloc(
        "email_campaigns.campaign_type_description.#{object.campaign_type}"
      )
    end
  end
end
