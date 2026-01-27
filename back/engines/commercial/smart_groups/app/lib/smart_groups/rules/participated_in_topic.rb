# frozen_string_literal: true

module SmartGroups::Rules
  class ParticipatedInTopic
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w[in not_in posted_in not_posted_in commented_in not_commented_in reacted_idea_in not_reacted_idea_in reacted_comment_in not_reacted_comment_in]
    MULTIVALUE_PREDICATES = %w[in posted_in commented_in reacted_idea_in reacted_comment_in]
    VALUELESS_PREDICATES = []

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true
    validate :value_in_topics

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
              enum: PREDICATE_VALUES - (VALUELESS_PREDICATES + MULTIVALUE_PREDICATES)
            },
            'value' => {
              'description' => 'The id of a topic',
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
              'description' => 'The ids of some of the topics',
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
      'participated_in_topic'
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

      case predicate
      when 'in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value))
        users_scope.where(id: participants)
      when 'not_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value))
        users_scope.where.not(id: participants)
      when 'posted_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:posting])
        users_scope.where(id: participants)
      when 'not_posted_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:posting])
        users_scope.where.not(id: participants)
      when 'commented_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:commenting])
        users_scope.where(id: participants)
      when 'not_commented_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:commenting])
        users_scope.where.not(id: participants)
      when 'reacted_idea_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:idea_reacting])
        users_scope.where(id: participants)
      when 'not_reacted_idea_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:idea_reacting])
        users_scope.where.not(id: participants)
      when 'reacted_comment_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:comment_reacting])
        users_scope.where(id: participants)
      when 'not_reacted_comment_in'
        participants = participants_service.input_topics_participants(InputTopic.where(id: value), actions: [:comment_reacting])
        users_scope.where.not(id: participants)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_value(locale)
      if multivalue_predicate?
        value.map do |v|
          InputTopic.find(v).title_multiloc[locale]
        end.join ', '
      else
        InputTopic.find(value).title_multiloc[locale]
      end
    end

    private

    def value_in_topics
      if multivalue_predicate?
        errors.add(:value, :has_invalid_topic) unless (value - InputTopic.ids).empty?
      else
        errors.add(:value, :has_invalid_topic) unless InputTopic.ids.include?(value)
      end
    end
  end
end
