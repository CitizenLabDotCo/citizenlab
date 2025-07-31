class WebApi::V1::Files::PreviewSerializer < WebApi::V1::BaseSerializer
  set_type :file_preview

  attributes :content, :status, :created_at, :updated_at

  belongs_to :file, serializer: WebApi::V1::FileV2Serializer
end
