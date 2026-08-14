# frozen_string_literal: true

module SmartGroups::Rules
  class CustomFieldText
    PREDICATE_VALUES = %w[is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on is_empty not_is_empty]
    VALUELESS_PREDICATES = %w[is_empty not_is_empty]

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.registration.where(input_type: 'text').map(&:id) } }

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
              'type' => 'string'
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
      'custom_field_text'
    end

    def initialize(custom_field_id, predicate, value = nil)
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = value
    end

    def filter(users_scope)
      custom_field = CustomField.find(custom_field_id)
      answer_filter = AnswerableFilter.new(custom_field, users_scope)
      case predicate
      when 'is'
        answer_filter.eq(value)
      when 'not_is'
        answer_filter.not_eq(value)
      when 'contains'
        answer_filter.matching("%#{value}%")
      when 'not_contains'
        answer_filter.not_matching("%#{value}%").and(answer_filter.present)
      when 'begins_with'
        answer_filter.matching("#{value}%")
      when 'not_begins_with'
        answer_filter.not_matching("#{value}%").and(answer_filter.present)
      when 'ends_on'
        answer_filter.matching("%#{value}")
      when 'not_ends_on'
        answer_filter.not_matching("%#{value}").and(answer_filter.present)
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
