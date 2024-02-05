# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      # 'GenderWidget' => Queries::Analytics::UsersByGender,
      'GenderWidget' => Queries::UsersByCustomField::Gender,
      'AgeWidget' => Queries::UsersByCustomField::Birthyear,
      'ReactionsByTimeWidget' => Queries::Analytics::ReactionsByTime,
      'CommentsByTimeWidget' => Queries::Analytics::CommentsByTime,
      'PostsByTimeWidget' => Queries::Analytics::PostsByTime,
      'ActiveUsersWidget' => Queries::Analytics::ActiveUsers,
      'VisitorsWidget' => Queries::Analytics::Visitors,
      'VisitorsTrafficSourcesWidget' => Queries::Analytics::TrafficSources,
      'SurveyResultsWidget' => Queries::SurveyResults,
      'SurveyQuestionResultWidget' => Queries::SurveyQuestionResult,
      'MostReactedIdeasWidget' => Queries::MostReactedIdeas
    }.freeze

    def initialize(current_user)
      @current_user = current_user
    end

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kargs = props.to_h.transform_keys(&:snakecase).symbolize_keys
      klass.new(@current_user).run_query(**kargs)
    end
  end
end
