# frozen_string_literal: true

module SmartGroups::Rules
  class Imported
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w[is_imported is_not_imported]

    attr_accessor :predicate

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }

    def self.to_json_schema
      {
        'type' => 'object',
        'additionalProperties' => false,
        'required' => %w[ruleType predicate],
        'properties' => {
          'ruleType' => {
            'type' => 'string',
            'enum' => [rule_type]
          },
          'predicate' => {
            'type' => 'string',
            'enum' => PREDICATE_VALUES
          }
        }
      }
    end

    def self.rule_type
      'imported'
    end

    def self.from_json(json)
      new(json['predicate'])
    end

    def initialize(predicate)
      self.predicate = predicate
    end

    # The result of the `filter` query depends on the `users` table only, so the query can be cached.
    def cachable_by_users_scope?
      true
    end

    def filter(users_scope)
      case predicate
      when 'is_imported'
        users_scope.where(imported: true)
      when 'is_not_imported'
        users_scope.where(imported: false)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end
  end
end
