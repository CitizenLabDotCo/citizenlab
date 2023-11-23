# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      'GenderWidget' => Queries::UsersByGender,
      'ReactionsByTimeWidget' => Queries::ReactionsByTime
    }.freeze

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kargs = props.to_h.transform_keys(&:snakecase).symbolize_keys
      run_query(klass.new.query(**kargs))
    end

    protected

    def run_query(json_query)
      results, errors, _paginations = Analytics::MultipleQueries.new.run(json_query)
      if errors.present?
        raise "Error processing Analytics query: #{errors.to_json}"
      end

      results
    end
  end
end
