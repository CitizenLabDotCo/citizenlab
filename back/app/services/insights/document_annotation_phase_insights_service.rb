module Insights
  class DocumentAnnotationPhaseInsightsService < BasePhaseInsightsService
    private

    # Annotating happens in the embedded Konveio document, which keeps the
    # annotations on its own side. Nothing is recorded here, so the phase has no
    # participation to report and only the visit-based metrics are meaningful.
    def phase_participations
      {}
    end

    def phase_participation_method_metrics(_participations)
      {}
    end

    # nil reports the participant metrics as unknown. The 0 the base class
    # derives from the absent participation would instead claim we measured
    # nobody taking part.
    def base_metrics(participations, participant_ids, visits_service)
      super.merge(
        participants: nil,
        participants_7_day_percent_change: nil,
        participation_rate_as_percent: nil,
        participation_rate_7_day_percent_change: nil
      )
    end
  end
end
