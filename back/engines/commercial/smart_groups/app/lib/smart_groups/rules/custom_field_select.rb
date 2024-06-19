# frozen_string_literal: true

module SmartGroups::Rules
  class CustomFieldSelect
    PREDICATE_VALUES = %w[has_value not_has_value is_one_of not_is_one_of is_empty not_is_empty]
    VALUELESS_PREDICATES = %w[is_empty not_is_empty]
    MULTIVALUE_PREDICATES = %w[is_one_of not_is_one_of]

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.registration.where(input_type: %w[select multiselect]).map(&:id) } }
    validate :validate_value_inclusion

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
              enum: PREDICATE_VALUES - (VALUELESS_PREDICATES + MULTIVALUE_PREDICATES)
            },
            'value' => {
              'description' => 'The id of one of the options of the custom field',
              '$ref': '#/definitions/customFieldOptionId'
            }
          }
        },
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
              enum: MULTIVALUE_PREDICATES
            },
            'value' => {
              'description' => 'The ids of some of the options of the custom field',
              'type' => 'array',
              'items' => {
                '$ref': '#/definitions/customFieldOptionId'
              },
              'uniqueItems' => true,
              'minItems' => 1
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
      'custom_field_select'
    end

    def initialize(custom_field_id, predicate, value = nil)
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = value
    end

    def filter(users_scope)
      custom_field = CustomField.find(custom_field_id)
      key = custom_field.key
      case custom_field.input_type
      when 'select'
        case predicate
        when 'has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("custom_field_values->>'#{key}' = ?", option_key)
        when 'not_has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("custom_field_values->>'#{key}' IS NULL OR custom_field_values->>'#{key}' != ?", option_key)
        when 'is_one_of'
          option_keys = CustomFieldOption.where(id: value).pluck :key
          users_scope.where("custom_field_values->>'#{key}' IN (?)", option_keys)
        when 'not_is_one_of'
          option_keys = CustomFieldOption.where(id: value).pluck :key
          users_scope.where("custom_field_values->>'#{key}' IS NULL OR custom_field_values->>'#{key}' NOT IN (?)", option_keys)
        when 'is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NULL")
        when 'not_is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NOT NULL")
        else
          raise "Unsupported predicate #{predicate}"
        end
      when 'multiselect'
        case predicate
        when 'has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("(custom_field_values->>'#{key}')::jsonb ? :value", value: option_key)
        when 'not_has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("custom_field_values->>'#{key}' IS NULL OR NOT (custom_field_values->>'#{key}')::jsonb ? :value", value: option_key)
        when 'is_one_of'
          option_keys = CustomFieldOption.where(id: value).pluck :key
          users_scope.where("(custom_field_values->>'#{key}')::jsonb ?| array[:value]", value: option_keys)
        when 'not_is_one_of'
          option_keys = CustomFieldOption.where(id: value).pluck :key
          users_scope.where("custom_field_values->>'#{key}' IS NULL OR NOT ((custom_field_values->>'#{key}')::jsonb ?| array[:value])", value: option_keys)
        when 'is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NULL OR (custom_field_values->>'#{key}')::jsonb = '[]'::jsonb")
        when 'not_is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NOT NULL AND (custom_field_values->>'#{key}')::jsonb != '[]'::jsonb")
        else
          raise "Unsupported predicate #{predicate}"
        end
      end
    end

    def description_value(locale)
      if value.is_a? Array
        value.map do |v|
          CustomFieldOption.find(v).title_multiloc[locale]
        end.join ', '
      else
        CustomFieldOption.find(value).title_multiloc[locale]
      end
    end

    private

    def needs_value?
      VALUELESS_PREDICATES.exclude?(predicate)
    end

    def validate_value_inclusion
      return unless needs_value?

      custom_field_ids = CustomFieldOption.where(custom_field_id: custom_field_id).map(&:id)
      is_included = if value.is_a? Array
        (value - custom_field_ids).blank?
      else
        custom_field_ids.include? value
      end
      return if is_included

      errors.add(
        :value,
        :inclusion,
        message: 'All values must be existing custom field option IDs'
      )
    end
  end
end
