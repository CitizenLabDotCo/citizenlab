# frozen_string_literal: true

module PhasePlacementStrategy
  class OnTimeline < Base
    def sequential?
      true
    end

    def presented_as_page?
      true
    end
  end
end
