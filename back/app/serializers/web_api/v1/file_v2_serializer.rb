# frozen_string_literal: true

class WebApi::V1::FileV2Serializer < WebApi::V1::BaseSerializer
  set_type :file

  attributes :name, :size, :mime_type, :created_at, :updated_at

  belongs_to :uploader, serializer: WebApi::V1::UserSerializer
  has_many :projects, serializer: WebApi::V1::ProjectSerializer
end
