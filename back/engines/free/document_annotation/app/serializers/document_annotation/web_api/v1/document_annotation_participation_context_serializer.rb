# frozen_string_literal: true

module DocumentAnnotation::WebApi::V1::DocumentAnnotationParticipationContextSerializer
  extend ActiveSupport::Concern

  included do
    with_options if: proc { |object|
      object.participation_context?
    } do
      attribute :document_annotation_embed_url
      attribute :document_annotation_service
    end
  end
end
