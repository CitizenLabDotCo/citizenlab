# frozen_string_literal: true

module DocumentAnnotation::WebApi::V1::DocumentAnnotationPhaseSerializer
  extend ActiveSupport::Concern

  included do
    attribute :document_annotation_embed_url
  end
end
