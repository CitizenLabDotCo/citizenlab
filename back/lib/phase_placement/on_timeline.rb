# frozen_string_literal: true

module PhasePlacement
  class OnTimeline < Base
    def sequential?
      true
    end

    def presented_as_page?
      true
    end
  end
end
