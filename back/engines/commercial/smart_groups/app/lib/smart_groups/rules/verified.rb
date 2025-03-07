# frozen_string_literal: true

module SmartGroups
  module Rules
    class Verified
      include ActiveModel::Validations

      PREDICATE_VALUES = %w[is_verified not_is_verified]

      attr_accessor :predicate, :value

      validates :predicate, presence: true
      validates :predicate, inclusion: { in: PREDICATE_VALUES }
      validates :value, absence: true, unless: :needs_value?
      validates :value, presence: true, if: :needs_value?

      def self.to_json_schema
        [
          {
            type: 'object',
            'required' => %w[ruleType predicate],
            'additionalProperties' => false,
            'properties' => {
              'ruleType' => {
                'type' => 'string',
                'enum' => [rule_type]
              },
              'predicate' => {
                type: 'string',
                enum: PREDICATE_VALUES
              }
            }
          }
        ]
      end

      def self.rule_type
        'verified'
      end

      def self.from_json(json)
        new json['predicate']
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
        when 'is_verified'
          users_scope.where(verified: true)
        when 'not_is_verified'
          users_scope.where(verified: false)
        else
          raise "Unsupported predicate #{predicate}"
        end
      end

      private

      def needs_value?
        false
      end
    end
  end
end
