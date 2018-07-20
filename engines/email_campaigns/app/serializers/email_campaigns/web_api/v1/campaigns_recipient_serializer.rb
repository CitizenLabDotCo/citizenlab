module EmailCampaigns
  class WebApi::V1::CampaignsRecipientSerializer < ActiveModel::Serializer
    attributes :id, :delivery_status

    belongs_to :user, serializer: ::WebApi::V1::UserSerializer 
    
  end
end
