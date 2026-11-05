# frozen_string_literal: true

module Facets
  # Counts, per facet, how many records fall under each of its options, the
  # numbers shown next to the options of a filter sidebar.
  # See https://yonik.com/multi-select-faceting/
  class CountsService
    def counts(records, scopes_by_facet)
      scopes_by_facet
        .reduce({}) do |result, (facet, scope)|
          # Counts need no order, and GROUP BY rejects a search ranking.
          result.deep_merge(facet.key => facet.counts(scope.reorder(nil)))
        end
        .merge('total' => records.size)
    end
  end
end
