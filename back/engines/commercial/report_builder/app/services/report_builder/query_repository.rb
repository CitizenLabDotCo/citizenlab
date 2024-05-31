# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      'GenderWidget' => Queries::UsersByCustomField::Gender,
      'AgeWidget' => Queries::UsersByCustomField::Birthyear,
      'ReactionsByTimeWidget' => Queries::Analytics::ReactionsByTime,
      'CommentsByTimeWidget' => Queries::Analytics::CommentsByTime,
      'PostsByTimeWidget' => Queries::Analytics::PostsByTime,
      'ParticipantsWidget' => Queries::Analytics::Participants,
      'VisitorsWidget' => Queries::Analytics::Visitors,
      'VisitorsTrafficSourcesWidget' => Queries::Analytics::TrafficSources,
      'SurveyQuestionResultWidget' => Queries::SurveyQuestionResult,
      'MostReactedIdeasWidget' => Queries::MostReactedIdeas,
      'SingleIdeaWidget' => Queries::SingleIdea,
      'DemographicsWidget' => Queries::Demographics,
      'RegistrationsWidget' => Queries::Analytics::Registrations,
      'MethodsUsedWidget' => Queries::MethodsUsed,
      'ParticipationWidget' => Queries::Analytics::Participation,
      'ProjectsWidget' => Queries::Projects
    }.freeze

    def initialize(current_user)
      @current_user = current_user
    end

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kwargs = props.to_h.transform_keys(&:snakecase).symbolize_keys
      klass.new(@current_user).run_query(**kwargs)
    end
  end
end
