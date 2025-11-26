module Insights
  class IdeationPhaseInsightsService < BasePhaseInsightsService
    private

    def test
      Rails.logger.info @phase.participation_method
    end
  end
end
