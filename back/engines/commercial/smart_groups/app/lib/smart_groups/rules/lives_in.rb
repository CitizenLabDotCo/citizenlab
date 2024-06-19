# frozen_string_literal: true

module SmartGroups::Rules
  class LivesIn
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w[has_value not_has_value is_one_of not_is_one_of is_empty not_is_empty]
    VALUELESS_PREDICATES = %w[is_empty not_is_empty]
    MULTIVALUE_PREDICATES = %w[is_one_of not_is_one_of]

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, absence: true, unless: :needs_value?
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
              'description' => 'The id of an area',
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
              'description' => 'The id of an area',
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
      'lives_in'
    end

    def self.from_json(json)
      new(json['predicate'], json['value'])
    end

    def initialize(predicate, value = nil)
      self.predicate = predicate
      self.value = value
    end

    # The result of the `filter` query depends on the `users` table only, so the query can be cached.
    def cachable_by_users_scope?
      true
    end

    def filter(users_scope)
      case predicate
      when 'has_value'
        users_scope.where("custom_field_values->>'domicile' = ?", value)
      when 'not_has_value'
        users_scope.where("custom_field_values->>'domicile' IS NULL or custom_field_values->>'domicile' != ?", value)
      when 'is_one_of'
        users_scope.where("custom_field_values->>'domicile' IN (?)", value)
      when 'not_is_one_of'
        users_scope.where("custom_field_values->>'domicile' IS NULL OR custom_field_values->>'domicile' NOT IN (?)", value)
      when 'is_empty'
        users_scope.where("custom_field_values->>'domicile' IS NULL")
      when 'not_is_empty'
        users_scope.where("custom_field_values->>'domicile' IS NOT NULL")
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_property(locale)
      CustomField.registration.find_by(key: 'domicile').title_multiloc[locale]
    end

    def description_rule_type
      case value
      when 'outside'
        self.class.rule_type
      else
        CustomFieldSelect.rule_type
      end
    end

    def description_value(locale)
      if value.is_a? Array
        value.map do |v|
          description_single_value v, locale
        end.join ', '
      else
        description_single_value value, locale
      end
    end

    private

    def needs_value?
      VALUELESS_PREDICATES.exclude?(predicate)
    end

    def description_single_value(value, locale)
      case value
      when 'outside'
        I18n.with_locale(locale) do
          I18n.t!('symbols.outside')
        end
      else
        Area.find(value).title_multiloc[locale]
      end
    end

    def validate_value_inclusion
      return unless needs_value?

      allowed_values = ['outside'] + Area.ids
      is_included = if value.is_a? Array
        (value - allowed_values).blank?
      else
        allowed_values.include? value
      end
      return if is_included

      errors.add(
        :value,
        :inclusion,
        message: 'All values must be existing area IDs or the value "outside"'
      )
    end
  end
end
