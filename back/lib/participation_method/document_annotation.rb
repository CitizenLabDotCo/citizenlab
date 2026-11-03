# frozen_string_literal: true

module ParticipationMethod
  class DocumentAnnotation < Base
    def self.method_str
      'document_annotation'
    end

    def phase_insights_class
      Insights::DocumentAnnotationPhaseInsightsService
    end
  end
end
