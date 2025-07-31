# frozen_string_literal: true

class WebApi::V1::Files::TranscriptSerializer < WebApi::V1::BaseSerializer
  attributes :status, :text, :confidence, :language_code, :words, :utterances, :metadata, :features, :error_message, :created_at, :updated_at

  belongs_to :file, serializer: WebApi::V1::FileV2Serializer
end
