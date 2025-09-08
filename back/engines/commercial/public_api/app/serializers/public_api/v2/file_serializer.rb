# frozen_string_literal: true

class PublicApi::V2::FileSerializer < PublicApi::V2::BaseSerializer
  attributes :id,
    :name,
    :size,
    :mime_type,
    :category,
    :ai_processing_allowed,
    :uploader_id,
    :created_at,
    :updated_at

  multiloc_attribute :description_multiloc

  attribute :url do
    object.content.url
  end
end
