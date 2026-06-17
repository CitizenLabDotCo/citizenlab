# frozen_string_literal: true

class WebApi::V1::Sms::DeliverySerializer < WebApi::V1::BaseSerializer
  attributes :status, :phone_number, :message_sid, :created_at, :updated_at

  belongs_to :user, serializer: ::WebApi::V1::UserSerializer
end
