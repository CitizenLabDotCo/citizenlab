# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      'GenderWidget' => Queries::Analytics::UsersByGender,
      'ReactionsByTimeWidget' => Queries::Analytics::ReactionsByTime,
      'SurveyResultsWidget' => Queries::SurveyResults
    }.freeze

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kargs = props.to_h.transform_keys(&:snakecase).symbolize_keys
      klass.new.run_query(**kargs)
    end
  end
end
