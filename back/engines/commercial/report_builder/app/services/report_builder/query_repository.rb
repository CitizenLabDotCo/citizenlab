# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      'ReactionsByTimeWidget' => Queries::Analytics::ReactionsByTime,
      'VisitorsWidget' => Queries::Visitors,
      'ParticipantsWidget' => Queries::Participants,
      'VisitorsTrafficSourcesWidget' => Queries::Analytics::TrafficSources,
      'SurveyQuestionResultWidget' => Queries::SurveyQuestionResult,
      'MostReactedIdeasWidget' => Queries::MostReactedIdeas,
      'SingleIdeaWidget' => Queries::SingleIdea,
      'DemographicsWidget' => Queries::Demographics,
      'RegistrationsWidget' => Queries::Registrations,
      'MethodsUsedWidget' => Queries::MethodsUsed,
      'ParticipationWidget' => Queries::Analytics::Participation,
      'ProjectsWidget' => Queries::Projects,
      'DeviceTypesWidget' => Queries::DeviceTypes,
      'VisitorsLanguagesWidget' => Queries::VisitorsLanguages
    }.freeze

    def initialize(current_user)
      @current_user = current_user
    end

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kwargs = props.to_h.transform_keys { |key| ::Utils.snakecase(key) }.symbolize_keys
      klass.new(@current_user).run_query(**kwargs)
    end
  end
end
