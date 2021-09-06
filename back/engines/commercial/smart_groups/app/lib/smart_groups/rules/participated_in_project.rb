module SmartGroups::Rules
  class ParticipatedInProject
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w(in not_in posted_in not_posted_in commented_in not_commented_in voted_idea_in not_voted_idea_in voted_comment_in not_voted_comment_in budgeted_in not_budgeted_in volunteered_in not_volunteered_in)
    MULTIVALUE_PREDICATES = %w(in posted_in commented_in voted_idea_in voted_comment_in budgeted_in volunteered_in)
    VALUELESS_PREDICATES = []

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true
    validate :value_in_projects

    def self.to_json_schema
      [
        {
          "type": "object",
          "required" => ["ruleType", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [rule_type],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES - (VALUELESS_PREDICATES + MULTIVALUE_PREDICATES),
            },
            "value" => {
              "description" => "The id of a project",
              "type" => "string"
            }
          },
        },
        {
          "type": "object",
          "required" => ["ruleType", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [rule_type],
            },
            "predicate" => {
              "type": "string",
              "enum": MULTIVALUE_PREDICATES,
            },
            "value" => {
              "description" => "The ids of some of the projects",
              "type" => "array",
              "items" => {
                "type" => "string"
              },
              "uniqueItems" => true,
              "minItems" => 1
            }
          },
        }
      ]
    end

    def self.rule_type
      'participated_in_project'
    end

    def self.from_json json
      self.new(json['predicate'], json['value'])
    end

    def initialize predicate, value
      self.predicate = predicate
      self.value = value
    end

    def multivalue_predicate?
      MULTIVALUE_PREDICATES.include? predicate
    end

    def filter users_scope
      participants_service = ParticipantsService.new

      case predicate
      when 'in'
        participants = participants_service.projects_participants(Project.where(id: value))
        users_scope.where(id: participants)
      when 'not_in'
        participants = participants_service.projects_participants(Project.where(id: value))
        users_scope.where.not(id: participants)
      when 'posted_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:posting])
        users_scope.where(id: participants)
      when 'not_posted_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:posting])
        users_scope.where.not(id: participants)
      when 'commented_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:commenting])
        users_scope.where(id: participants)
      when 'not_commented_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:commenting])
        users_scope.where.not(id: participants)
      when 'voted_idea_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:idea_voting])
        users_scope.where(id: participants)
      when 'not_voted_idea_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:idea_voting])
        users_scope.where.not(id: participants)
      when 'voted_comment_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:comment_voting])
        users_scope.where(id: participants)
      when 'not_voted_comment_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:comment_voting])
        users_scope.where.not(id: participants)
      when 'budgeted_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:budgeting])
        users_scope.where(id: participants)
      when 'not_budgeted_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:budgeting])
        users_scope.where.not(id: participants)
      when 'volunteered_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:volunteering])
        users_scope.where(id: participants)
      when 'not_volunteered_in'
        participants = participants_service.projects_participants(Project.where(id: value), actions: [:volunteering])
        users_scope.where.not(id: participants)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_value locale
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
        errors.add(:value, :has_invalid_project) if !(value - Project.ids).empty?
      else
        errors.add(:value, :has_invalid_project) if !Project.ids.include?(value)
      end
    end

  end
end
