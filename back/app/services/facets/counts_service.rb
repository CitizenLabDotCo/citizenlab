# frozen_string_literal: true

module Facets
  # Counts, per facet, how many records fall under each of its options, the
  # numbers shown next to the options of a filter sidebar.
  # See https://yonik.com/multi-select-faceting/
  class CountsService
    def initialize(records, facets)
      # Counts need no order, and GROUP BY rejects a search ranking.
      @records = records.reorder(nil)
      @facets = facets
    end

    def counts
      @facets
        .reduce({}) { |result, facet| result.deep_merge(facet.key => facet.counts(@records)) }
        .merge('total' => @records.count)
    end
  end
end
