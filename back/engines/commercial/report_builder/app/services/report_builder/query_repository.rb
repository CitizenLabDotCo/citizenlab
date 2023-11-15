# frozen_string_literal: true

require 'query'

module ReportBuilder
  # TODO: rename to sth else
  class QueryRepository
    GRAPH_RESOLVED_NAMES_METHODS = {
      'GenderWidget' => Queries::UsersByGender,
      'ReactionsByTime' => Queries::ReactionsByTime
    }.freeze

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_METHODS[graph_resolved_name]
      return unless klass

      run_query(klass.new.query(**props))
    end

    protected

    def run_query(json_query)
      query = Analytics::Query.new(json_query.with_indifferent_access)
      # TODO: it's weird to validate and do not check the result. Fix this.
      query.validate
      query.run
      query.results
    end
  end
end
