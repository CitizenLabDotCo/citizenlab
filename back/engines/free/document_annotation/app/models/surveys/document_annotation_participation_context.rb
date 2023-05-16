# frozen_string_literal: true

module DocumentAnnotation::DocumentAnnotationParticipationContext
  extend ActiveSupport::Concern

  DOCUMENT_ANNOTATION_SERVICES = %w[konveio].freeze

  included do
    with_options if: :document_annotation?, unless: :timeline_project? do
      validates :document_annotation_embed_url, presence: true
      validates :document_annotation, presence: true, inclusion: { in: SURVEY_SERVICES }
      validates :survey_embed_url, if: %i[survey? konveio?], format: {
        with: %r{\Ahttps://.*\.konveio\.com/.*\z},
        message: 'Not a valid Konveio embed URL' # rubocop:disable Rails/I18nLocaleTexts
      }
      before_validation :strip_survey_embed_url
    end
  end

  def document_annotation?
    participation_method == 'document_annotation'
  end

  private

  def konveio?
    survey_service == 'konveio'
  end

  def strip_survey_embed_url
    self.survey_embed_url = survey_embed_url&.strip
  end
end
