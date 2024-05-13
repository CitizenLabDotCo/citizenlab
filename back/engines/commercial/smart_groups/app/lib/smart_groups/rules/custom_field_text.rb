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
      key = custom_field.key
      case predicate
      when 'is'
        users_scope.where("custom_field_values->>'#{key}' = ?", value)
      when 'not_is'
        users_scope.where("custom_field_values->>'#{key}' IS NULL or custom_field_values->>'#{key}' != ?", value)
      when 'contains'
        users_scope.where("custom_field_values->>'#{key}' LIKE ?", "%#{value}%")
      when 'not_contains'
        users_scope.where("custom_field_values->>'#{key}' NOT LIKE ?", "%#{value}%")
      when 'begins_with'
        users_scope.where("custom_field_values->>'#{key}' LIKE ?", "#{value}%")
      when 'not_begins_with'
        users_scope.where("custom_field_values->>'#{key}' NOT LIKE ?", "#{value}%")
      when 'ends_on'
        users_scope.where("custom_field_values->>'#{key}' LIKE ?", "%#{value}")
      when 'not_ends_on'
        users_scope.where("custom_field_values->>'#{key}' NOT LIKE ?", "%#{value}")
      when 'is_empty'
        users_scope.where("custom_field_values->>'#{key}' IS NULL")
      when 'not_is_empty'
        users_scope.where("custom_field_values->>'#{key}' IS NOT NULL")
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
