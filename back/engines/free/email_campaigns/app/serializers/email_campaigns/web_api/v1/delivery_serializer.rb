module EmailCampaigns
  class WebApi::V1::DeliverySerializer < ::WebApi::V1::BaseSerializer
    attributes :delivery_status, :sent_at, :created_at, :updated_at

    belongs_to :user, serializer: ::WebApi::V1::UserSerializer 
  end
end
