# frozen_string_literal: true

module ParticipationMethod
  class Poll < Base
    def self.method_str
      'poll'
    end

    def phase_insights_class
      Insights::PollPhaseInsightsService
    end
  end
end
