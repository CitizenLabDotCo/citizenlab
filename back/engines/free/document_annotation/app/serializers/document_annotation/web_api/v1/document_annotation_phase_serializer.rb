# frozen_string_literal: true

module DocumentAnnotation::WebApi::V1::DocumentAnnotationPhaseSerializer
  extend ActiveSupport::Concern

  included do
    with_options if: proc { |object|
      object.participation_context?
    } do
      attribute :document_annotation_embed_url
    end
  end
end
