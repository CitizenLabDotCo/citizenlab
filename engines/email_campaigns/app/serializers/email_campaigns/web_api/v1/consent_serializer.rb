module EmailCampaigns
  class WebApi::V1::ConsentSerializer < ActiveModel::Serializer
    attributes :id, :campaign_type, :consented, :created_at, :updated_at
  end
end
