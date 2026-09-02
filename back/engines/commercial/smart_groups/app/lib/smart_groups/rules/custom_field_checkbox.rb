# frozen_string_literal: true

module SmartGroups::Rules
  class CustomFieldCheckbox
    PREDICATE_VALUES = %w[is_checked not_is_checked]

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.registration.where(input_type: 'checkbox').map(&:id) } }

    def self.to_json_schema
      [
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
              'enum' => PREDICATE_VALUES
            }
          }
        }
      ]
    end

    def self.rule_type
      'custom_field_checkbox'
    end

    def initialize(custom_field_id, predicate, _value = nil)
      self.custom_field_id = custom_field_id
      self.predicate = predicate
    end

    def filter(users_scope)
      custom_field = CustomField.find(custom_field_id)
      return unless custom_field.input_type == 'checkbox'

      answer_filter = AnswerableFilter.new(custom_field, users_scope)
      case predicate
      when 'is_checked'
        answer_filter.eq(true)
      when 'not_is_checked'
        answer_filter.eq(false)
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
