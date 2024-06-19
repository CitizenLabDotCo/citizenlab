# frozen_string_literal: true

module SmartGroups::Rules
  class CustomFieldDate
    PREDICATE_VALUES = %w[is_before is_exactly is_after is_empty not_is_empty]
    VALUELESS_PREDICATES = %w[is_empty not_is_empty]

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.registration.where(input_type: 'date').map(&:id) } }
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
              'description' => 'The date formatted as yyyy-mm-dd',
              type: 'string',
              format: 'date',
              pattern: '[0-9]{4}-[0-9]{2}-[0-9]{2}$'
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
      'custom_field_date'
    end

    def initialize(custom_field_id, predicate, value = nil)
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = if value.instance_of?(Time)
        value.to_date.to_s
      else
        value.to_s
      end
    end

    def filter(users_scope)
      custom_field = CustomField.find(custom_field_id)
      key = custom_field.key
      return unless custom_field.input_type == 'date'

      case predicate
      when 'is_before'
        users_scope.where("(custom_field_values->>'#{key}')::date < (?)::date", value)
      when 'is_after'
        users_scope.where("(custom_field_values->>'#{key}')::date > (?)::date", value)
      when 'is_exactly'
        users_scope.where("(custom_field_values->>'#{key}')::date >= (?)::date AND (custom_field_values->>'#{key}')::date < ((?)::date + '1 day'::interval)", value, value)
      when 'is_empty'
        users_scope.where("custom_field_values->>'#{key}' IS NULL")
      when 'not_is_empty'
        users_scope.where("custom_field_values->>'#{key}' IS NOT NULL")
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_value(locale)
      return if value.blank?

      locale ||= I18n.locale
      I18n.with_locale(locale) do
        I18n.l Date.parse(value), format: :default
      end
    end

    private

    def needs_value?
      VALUELESS_PREDICATES.exclude?(predicate)
    end
  end
end
