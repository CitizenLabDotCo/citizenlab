# frozen_string_literal: true

module DocumentAnnotation::DocumentAnnotationParticipationContext
  extend ActiveSupport::Concern

  DOCUMENT_ANNOTATION_SERVICES = %w[konveio].freeze

  included do
    with_options if: :document_annotation?, unless: :timeline_project? do
      validates :document_annotation_embed_url, presence: true
      validates :document_annotation_service, presence: true, inclusion: { in: DOCUMENT_ANNOTATION_SERVICES }
      validates :document_annotation_embed_url, if: %i[document_annotation? konveio?], format: {
        with: %r{\Ahttps://.*\.konveio\.com/.*\z},
        message: 'Not a valid Konveio embed URL' # rubocop:disable Rails/I18nLocaleTexts
      }
      before_validation :strip_document_annotation_embed_url
    end
  end

  def document_annotation?
    participation_method == 'document_annotation'
  end

  private

  def konveio?
    document_annotation_service == 'konveio'
  end

  def strip_document_annotation_embed_url
    self.document_annotation_embed_url = document_annotation_embed_url&.strip
  end
end
