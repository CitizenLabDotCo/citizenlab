# frozen_string_literal: true

module SmartGroups::Rules
  class ParticipatedInProject
    include ActiveModel::Validations
    include DescribableRule

    VALUELESS_PREDICATES = []
    SINGLEVALUE_PREDICATES = %w[
      not_commented_in
      not_in
      not_posted_in
      not_reacted_comment_in
      not_reacted_idea_in
      not_registered_to_an_event
      not_volunteered_in
      not_voted_in
    ]
    MULTIVALUE_PREDICATES = %w[
      commented_in
      in
      posted_in
      reacted_comment_in
      reacted_idea_in
      registered_to_an_event
      volunteered_in
      voted_in
    ]
    PREDICATE_VALUES = VALUELESS_PREDICATES + SINGLEVALUE_PREDICATES + MULTIVALUE_PREDICATES

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true
    validate :value_in_projects

    def self.to_json_schema
      [
        {
          type: 'object',
          'required' => %w[ruleType predicate value],
          'additionalProperties' => false,
          'properties' => {
            'ruleType' => {
              'type' => 'string',
              'enum' => [rule_type]
            },
            'predicate' => {
              type: 'string',
              enum: SINGLEVALUE_PREDICATES
            },
            'value' => {
              'description' => 'The id of a project',
              'type' => 'string'
            }
          }
        },
        {
          type: 'object',
          'required' => %w[ruleType predicate value],
          'additionalProperties' => false,
          'properties' => {
            'ruleType' => {
              'type' => 'string',
              'enum' => [rule_type]
            },
            'predicate' => {
              type: 'string',
              enum: MULTIVALUE_PREDICATES
            },
            'value' => {
              'description' => 'The ids of some of the projects',
              'type' => 'array',
              'items' => {
                'type' => 'string'
              },
              'uniqueItems' => true,
              'minItems' => 1
            }
          }
        }
      ]
    end

    def self.rule_type
      'participated_in_project'
    end

    def self.from_json(json)
      new(json['predicate'], json['value'])
    end

    def initialize(predicate, value)
      self.predicate = predicate
      self.value = value
    end

    # The filter queries more than just the `users` table, so we cannot cache the result via the users scope.
    def cachable_by_users_scope?
      false
    end

    def multivalue_predicate?
      MULTIVALUE_PREDICATES.include? predicate
    end

    def filter(users_scope)
      participants_service = ParticipantsService.new
      projects = Project.where(id: value)

      case predicate
      when 'commented_in'
        participants = participants_service.projects_participants(projects, actions: [:commenting])
        users_scope.where(id: participants)
      when 'not_commented_in'
        participants = participants_service.projects_participants(projects, actions: [:commenting])
        users_scope.where.not(id: participants)
      when 'in'
        participants = participants_service.projects_participants(projects)
        users_scope.where(id: participants)
      when 'not_in'
        participants = participants_service.projects_participants(projects)
        users_scope.where.not(id: participants)
      when 'posted_in'
        participants = participants_service.projects_participants(projects, actions: [:posting])
        users_scope.where(id: participants)
      when 'not_posted_in'
        participants = participants_service.projects_participants(projects, actions: [:posting])
        users_scope.where.not(id: participants)
      when 'reacted_comment_in'
        participants = participants_service.projects_participants(projects, actions: [:comment_reacting])
        users_scope.where(id: participants)
      when 'not_reacted_comment_in'
        participants = participants_service.projects_participants(projects, actions: [:comment_reacting])
        users_scope.where.not(id: participants)
      when 'reacted_idea_in'
        participants = participants_service.projects_participants(projects, actions: [:idea_reacting])
        users_scope.where(id: participants)
      when 'not_reacted_idea_in'
        participants = participants_service.projects_participants(projects, actions: [:idea_reacting])
        users_scope.where.not(id: participants)
      when 'registered_to_an_event'
        participants = participants_service.projects_participants(projects, actions: [:event_attending])
        users_scope.where(id: participants)
      when 'not_registered_to_an_event'
        participants = participants_service.projects_participants(projects, actions: [:event_attending])
        users_scope.where.not(id: participants)
      when 'volunteered_in'
        participants = participants_service.projects_participants(projects, actions: [:volunteering])
        users_scope.where(id: participants)
      when 'not_volunteered_in'
        participants = participants_service.projects_participants(projects, actions: [:volunteering])
        users_scope.where.not(id: participants)
      when 'voted_in'
        participants = participants_service.projects_participants(projects, actions: [:voting])
        users_scope.where(id: participants)
      when 'not_voted_in'
        participants = participants_service.projects_participants(projects, actions: [:voting])
        users_scope.where.not(id: participants)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_value(locale)
      if multivalue_predicate?
        value.map do |v|
          Project.find(v).title_multiloc[locale]
        end.join ', '
      else
        Project.find(value).title_multiloc[locale]
      end
    end

    private

    def value_in_projects
      if multivalue_predicate?
        errors.add(:value, :has_invalid_project) unless (value - Project.ids).empty?
      else
        errors.add(:value, :has_invalid_project) unless Project.ids.include?(value)
      end
    end
  end
end
