# frozen_string_literal: true

module DocumentAnnotation::DocumentAnnotationParticipationContext
  extend ActiveSupport::Concern

  included do
    with_options if: :document_annotation?, unless: :timeline_project? do
      validates :document_annotation_embed_url, presence: true, format: {
        with: %r{\Ahttps://(?:.*\.konveio\.com|.*\.konveio\.site)/.*\z},
        message: 'Not a valid Konveio embed URL' # rubocop:disable Rails/I18nLocaleTexts
      }
      before_validation :strip_document_annotation_embed_url
    end
  end

  def document_annotation?
    participation_method == 'document_annotation'
  end

  private

  def strip_document_annotation_embed_url
    self.document_annotation_embed_url = document_annotation_embed_url&.strip
  end
end
