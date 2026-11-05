# frozen_string_literal: true

class WebApi::V1::FileV2Serializer < WebApi::V1::BaseSerializer
  set_type :file

  attributes(
    :name,
    :content,
    :description_multiloc,
    :category,
    :mime_type,
    :size,
    :ai_processing_allowed,
    :description_generation_status,
    :created_at,
    :updated_at
  )

  belongs_to :uploader, serializer: WebApi::V1::UserSerializer
  has_many :projects, serializer: WebApi::V1::ProjectSerializer
  has_many :attachments, serializer: WebApi::V1::Files::FileAttachmentSerializer
  has_one :preview, serializer: WebApi::V1::Files::PreviewSerializer
  has_one :transcript, serializer: WebApi::V1::Files::TranscriptSerializer
end
