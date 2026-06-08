# frozen_string_literal: true

module EmailCampaigns
  class WebApi::V1::SmsDeliverySerializer < ::WebApi::V1::BaseSerializer
    attributes :status, :phone_number, :created_at, :updated_at

    belongs_to :user, serializer: ::WebApi::V1::UserSerializer
  end
end
