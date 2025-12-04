# frozen_string_literal: true

module ParticipationMethod
  class Volunteering < Base
    def self.method_str
      'volunteering'
    end

    def phase_insights_class
      Insights::VolunteeringPhaseInsightsService
    end
  end
end
