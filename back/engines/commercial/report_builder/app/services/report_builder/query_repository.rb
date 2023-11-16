# frozen_string_literal: true

require 'multiple_queries'

module ReportBuilder
  # TODO: rename to sth else
  class QueryRepository
    GRAPH_RESOLVED_NAMES_METHODS = {
      'GenderWidget' => Queries::UsersByGender,
      'ReactionsByTimeWidget' => Queries::ReactionsByTime
    }.freeze

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_METHODS[graph_resolved_name]
      return unless klass

      run_query(klass.new.query(**props))
    end

    protected

    def run_query(json_query)
      # TODO: investigate why we need parameters and not HashWithIndifferentAccess
      json_query_params = ActionController::Parameters.new({ query: json_query }).permit![:query]
      results, errors, _paginations = Analytics::MultipleQueries.new.run(json_query_params)
      # TODO: it's weird to validate and do not check the result. Fix this.
      if errors.present?
        raise "Error processing Analytics query: #{errors.to_json}"
      end

      results
    end
  end
end
