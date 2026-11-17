# frozen_string_literal: true

module ReportBuilder
  class QueryRepository
    GRAPH_RESOLVED_NAMES_CLASSES = {
      'ReactionsByTimeWidget' => Queries::Analytics::ReactionsByTime,
      'VisitorsWidget' => Queries::Visitors,
      'ParticipantsWidget' => Queries::Participants,
      'VisitorsTrafficSourcesWidget' => Queries::TrafficSources,
      'SurveyQuestionResultWidget' => Queries::SurveyQuestionResult,
      'MostReactedIdeasWidget' => Queries::MostReactedIdeas,
      'SingleIdeaWidget' => Queries::SingleIdea,
      'DemographicsWidget' => Queries::Demographics,
      'RegistrationsWidget' => Queries::Registrations,
      'MethodsUsedWidget' => Queries::MethodsUsed,
      'ParticipationWidget' => Queries::Analytics::Participation,
      'ProjectsWidget' => Queries::Projects,
      'ProjectsTimelineWidget' => Queries::ProjectsTimeline,
      'DeviceTypesWidget' => Queries::DeviceTypes,
      'VisitorsLanguagesWidget' => Queries::VisitorsLanguages,
      'InternalAdoptionWidget' => Queries::InternalAdoption

    }.freeze

    # Widget props reach the backend in two spellings: snake_case from the live
    # endpoint, camelCase from the stored craftjs JSON. Whatever authorizes a
    # widget must read the same keys the query reads, so both go through here.
    # Two spellings of one prop collapse to the last one given.
    def self.normalize_props(props)
      props.to_h.transform_keys { |key| ::Utils.snakecase(key.to_s) }.with_indifferent_access
    end

    def initialize(current_user)
      @current_user = current_user
    end

    def data_by_graph(graph_resolved_name, props)
      klass = GRAPH_RESOLVED_NAMES_CLASSES[graph_resolved_name]
      return unless klass

      kwargs = self.class.normalize_props(props).symbolize_keys
      # Always determined by the platform setting, never by the widget props.
      kwargs[:exclude_admins_and_moderators] = StatisticsRoleExclusion.new.exclude_admins_and_moderators?
      klass.new(@current_user).run_query(**kwargs)
    end
  end
end
