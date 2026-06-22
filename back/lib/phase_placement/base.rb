# frozen_string_literal: true

# Strategy for how a phase is placed relative to the timeline, to enable parallel
# participation (e.g. extra surveys running alongside the timeline phases).
module PhasePlacement
  class Base
    def sequential?
      raise NotImplementedError
    end

    def presented_as_page?
      raise NotImplementedError
    end
  end
end
