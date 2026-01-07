# frozen_string_literal: true

module SmartGroups::Rules
  class Follow
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w[something nothing is_one_of_projects is_not_project is_one_of_folders is_not_folder is_one_of_inputs is_not_input is_one_of_topics is_not_topic is_one_of_areas is_not_area]
    MULTIVALUE_PREDICATES = %w[is_one_of_projects is_one_of_folders is_one_of_inputs is_one_of_topics is_one_of_areas]
    VALUELESS_PREDICATES = %w[something nothing]

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, presence: true, if: :needs_value?
    validate :validate_value_inclusion

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
              'description' => 'The id of an item that the user is following',
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
              'description' => 'The ids of some of the items that the user is following',
              'type' => 'array',
              'items' => {
                'type' => 'string'
              },
              'uniqueItems' => true,
              'minItems' => 1
            }
          }
        },
        {
          'type' => 'object',
          'required' => %w[ruleType predicate],
          'additionalProperties' => false,
          'properties' => {
            'ruleType' => {
              'type' => 'string',
              'enum' => [rule_type]
            },
            'predicate' => {
              'type' => 'string',
              'enum' => VALUELESS_PREDICATES
            }
          }
        }
      ]
    end

    def self.rule_type
      'follow'
    end

    def self.from_json(json)
      new(json['predicate'], json['value'])
    end

    def initialize(predicate, value = nil)
      self.predicate = predicate
      self.value = value if value
    end

    # The filter queries more than just the `users` table, so we cannot cache the result via the users scope.
    def cachable_by_users_scope?
      false
    end

    def multivalue_predicate?
      MULTIVALUE_PREDICATES.include? predicate
    end

    def singlevalue_predicate?
      (PREDICATE_VALUES - (VALUELESS_PREDICATES + MULTIVALUE_PREDICATES)).include? predicate
    end

    def filter(users_scope)
      case predicate
      when 'something'
        users_scope.from_follows(Follower.all) # where.associated returns duplicates and does not seem very well supported: https://github.com/rails/rails/issues/40719
      when 'nothing'
        users_scope.where.missing(:follows)
      when 'is_one_of_projects', 'is_one_of_folders', 'is_one_of_inputs', 'is_one_of_topics', 'is_one_of_areas'
        followers = Follower.where(followable_id: value)
        users_scope.from_follows(followers)
      when 'is_not_project', 'is_not_folder', 'is_not_input', '', 'is_not_topic', 'is_not_area'
        followers = Follower.where(followable_id: value, followable_type: followable_type.name)
        users_scope.where.not(id: users_scope.from_follows(followers))
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_value(locale)
      if multivalue_predicate?
        value.map do |v|
          followable_type.find(v).title_multiloc[locale]
        end.join ', '
      elsif singlevalue_predicate?
        followable_type.find(value).title_multiloc[locale]
      end
    end

    private

    def needs_value?
      VALUELESS_PREDICATES.exclude?(predicate)
    end

    def validate_value_inclusion
      if multivalue_predicate?
        errors.add(:value, :has_invalid_followable) unless (value - followable_type.ids).empty?
      elsif singlevalue_predicate?
        errors.add(:value, :has_invalid_followable) unless followable_type.ids.include?(value)
      end
    end

    def followable_type
      case predicate
      when 'is_one_of_projects', 'is_not_project'
        Project
      when 'is_one_of_folders', 'is_not_folder'
        ProjectFolders::Folder
      when 'is_one_of_inputs', 'is_not_input'
        Idea
      when 'is_one_of_topics', 'is_not_topic'
        GlobalTopic
      when 'is_one_of_areas', 'is_not_area'
        Area
      else
        raise "Unsupported predicate #{predicate}"
      end
    end
  end
end
