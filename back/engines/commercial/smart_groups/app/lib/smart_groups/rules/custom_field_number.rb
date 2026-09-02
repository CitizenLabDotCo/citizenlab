# frozen_string_literal: true

module SmartGroups::Rules
  class CustomFieldNumber
    PREDICATE_VALUES = %w[is_empty not_is_empty is_equal not_is_equal is_larger_than is_larger_than_or_equal is_smaller_than is_smaller_than_or_equal]
    VALUELESS_PREDICATES = %w[is_empty not_is_empty]

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.registration.where(input_type: 'number').map(&:id) } }
    validates :value, absence: true, unless: :needs_value?
    validates :value, presence: true, if: :needs_value?

    def self.to_json_schema
      [
        {
          type: 'object',
          'required' => %w[ruleType customFieldId predicate value],
          'additionalProperties' => false,
          'properties' => {
            'ruleType' => {
              'type' => 'string',
              'enum' => [rule_type]
            },
            'customFieldId' => {
              '$ref': '#/definitions/customFieldId'
            },
            'predicate' => {
              type: 'string',
              enum: PREDICATE_VALUES - VALUELESS_PREDICATES
            },
            'value' => {
              type: 'number'
            }
          }
        },
        {
          'type' => 'object',
          'required' => %w[ruleType customFieldId predicate],
          'additionalProperties' => false,
          'properties' => {
            'ruleType' => {
              'type' => 'string',
              'enum' => [rule_type]
            },
            'customFieldId' => {
              '$ref': '#/definitions/customFieldId'
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
      'custom_field_number'
    end

    def initialize(custom_field_id, predicate, value = nil)
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = value
    end

    def filter(users_scope)
      custom_field = CustomField.find(custom_field_id)
      return unless custom_field.input_type == 'number'

      answer_filter = AnswerableFilter.new(custom_field, users_scope)
      case predicate
      when 'is_equal'
        answer_filter.eq(value)
      when 'not_is_equal'
        answer_filter.not_eq(value)
      when 'is_larger_than'
        answer_filter.gt(value)
      when 'is_larger_than_or_equal'
        answer_filter.gteq(value)
      when 'is_smaller_than'
        answer_filter.lt(value)
      when 'is_smaller_than_or_equal'
        answer_filter.lteq(value)
      when 'is_empty'
        answer_filter.absent
      when 'not_is_empty'
        answer_filter.present
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    private

    def needs_value?
      VALUELESS_PREDICATES.exclude?(predicate)
    end
  end
end
