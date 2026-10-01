# frozen_string_literal: true

module ReportBuilder
  module Composition
    # What the model is allowed to do, in the shape Bedrock's Converse API wants.
    #
    # Kept apart from the loop that runs them, and grouped by what they are for. The
    # order is fixed: the list is part of the cached prefix of every request in a run,
    # so it has to be the same bytes each time.
    module Tools
      DEFINITIONS = (
        DataTools::DEFINITIONS + BlockTools::DEFINITIONS + LayoutTools::DEFINITIONS
      ).freeze
    end
  end
end
