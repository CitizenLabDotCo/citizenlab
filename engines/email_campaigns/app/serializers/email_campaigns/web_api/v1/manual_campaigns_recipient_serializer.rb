module EmailCampaigns
  class WebApi::V1::ManualCampaignsRecipientSerializer < ActiveModel::Serializer
    attributes :id, :delivery_status, :created_at, :updated_at

    belongs_to :user, serializer: ::WebApi::V1::UserSerializer 
    
  end
end
