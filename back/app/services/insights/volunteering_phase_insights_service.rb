module Insights
  class VolunteeringPhaseInsightsService < BasePhaseInsightsService
    private

    def phase_participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      { volunteering: participations_volunteering }
    end

    def participations_volunteering
      Volunteering::Volunteer
        .joins(:cause)
        .where(volunteering_causes: { phase_id: @phase.id })
        .map do |volunteering_volunteer|
          {
            item_id: volunteering_volunteer.id,
            action: 'volunteering',
            acted_at: volunteering_volunteer.created_at,
            classname: 'Volunteer',
            participant_id: participant_id(volunteering_volunteer.id, volunteering_volunteer.user_id),
            user_custom_field_values: volunteering_volunteer&.user&.custom_field_values || {}
          }
        end
    end

    def phase_participation_method_metrics(participations)
      volunteerings = participations[:volunteering] || []
      volunteerings_total = volunteerings.count
      volunteerings_last_7_days = volunteerings.count { |p| p[:acted_at] >= 7.days.ago }

      {
        volunteerings: volunteerings_total,
        volunteerings_last_7_days: volunteerings_last_7_days
      }
    end
  end
end
