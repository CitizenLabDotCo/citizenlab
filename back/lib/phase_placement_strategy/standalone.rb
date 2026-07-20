# frozen_string_literal: true

module PhasePlacementStrategy
  class Standalone < Base
    def sequential?
      false
    end

    def presented_as_page?
      false
    end
  end
end
