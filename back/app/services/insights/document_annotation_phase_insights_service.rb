module Insights
  class DocumentAnnotationPhaseInsightsService < BasePhaseInsightsService
    private

    # Annotating happens in the embedded Konveio document, which keeps the
    # annotations on its own side. Nothing is recorded here, so the phase has no
    # participations to report and only the visit-based metrics are meaningful.
    def phase_participations
      {}
    end

    def phase_participation_method_metrics(_participations)
      {}
    end
  end
end
