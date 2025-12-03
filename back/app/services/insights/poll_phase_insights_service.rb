module Insights
  class PollPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      { taking_poll: participation_taking_poll }
    end

    def participation_taking_poll
      Polls::Response
        .where(phase_id: @phase.id)
        .map do |response|
          {
            item_id: response.id,
            action: 'taking_poll',
            acted_at: response.created_at,
            classname: 'Response',
            participant_id: participant_id(response.id, response.user_id),
            user_custom_field_values: response&.user&.custom_field_values || {}
          }
        end
    end

    def phase_participation_method_metrics(participations)
      responses = participations[:taking_poll] || []
      responses_total = responses.count
      responses_last_7_days = responses.count { |p| p[:acted_at] >= 7.days.ago }

      {
        responses: responses_total,
        responses_last_7_days: responses_last_7_days
      }
    end
  end
end
