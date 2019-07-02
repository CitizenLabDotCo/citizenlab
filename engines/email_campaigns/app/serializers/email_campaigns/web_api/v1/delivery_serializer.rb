module EmailCampaigns
  class WebApi::V1::DeliverySerializer < ::WebApi::V1::Fast::BaseSerializer
    attributes :delivery_status, :sent_at, :created_at, :updated_at

    belongs_to :user, serializer: ::WebApi::V1::Fast::UserSerializer 
  end
end
