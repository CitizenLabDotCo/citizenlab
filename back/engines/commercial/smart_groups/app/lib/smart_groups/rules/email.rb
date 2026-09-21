# frozen_string_literal: true

module SmartGroups::Rules
  class Email
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w[is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on is_one_of not_is_one_of]
    MULTIVALUE_PREDICATES = %w[is_one_of not_is_one_of]
    MAX_VALUES = 5000

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, absence: true, unless: :needs_value?
    validates :value, presence: true, if: :needs_value?
    validate :validate_value_shape

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
              enum: PREDICATE_VALUES - MULTIVALUE_PREDICATES
            },
            'value' => {
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
              'description' => 'A list of email addresses',
              'type' => 'array',
              'items' => {
                'type' => 'string'
              },
              'uniqueItems' => true,
              'minItems' => 1,
              'maxItems' => MAX_VALUES
            }
          }
        }
      ]
    end

    def self.rule_type
      'email'
    end

    def self.from_json(json)
      new json['predicate'], json['value']
    end

    def initialize(predicate, value)
      self.predicate = predicate
      self.value = value
    end

    # The result of the `filter` query depends on the `users` table only, so the query can be cached.
    def cachable_by_users_scope?
      true
    end

    def filter(users_scope)
      case predicate
      when 'is'
        users_scope.where('lower(email) = lower(?)', value)
      when 'not_is'
        users_scope.where('email IS NULL or lower(email) != lower(?)', value)
      when 'contains'
        users_scope.where('email ILIKE ?', "%#{value}%")
      when 'not_contains'
        users_scope.where('email IS NULL or email NOT ILIKE ?', "%#{value}%")
      when 'begins_with'
        users_scope.where('email ILIKE ?', "#{value}%")
      when 'not_begins_with'
        users_scope.where('email IS NULL or email NOT ILIKE ?', "#{value}%")
      when 'ends_on'
        users_scope.where('email ILIKE ?', "%#{value}")
      when 'not_ends_on'
        users_scope.where('email IS NULL or email NOT ILIKE ?', "%#{value}")
      when 'is_one_of'
        users_scope.where('lower(email) IN (?)', normalized_values)
      when 'not_is_one_of'
        users_scope.where('email IS NULL or lower(email) NOT IN (?)', normalized_values)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    # The single-value predicates describe themselves with the text field strings,
    # which have no equivalent for the list predicates.
    def description_rule_type
      return self.class.rule_type if multivalue_predicate?

      CustomFieldText.rule_type
    end

    def description_property(locale)
      I18n.with_locale(locale) do
        I18n.t!('smart_group_rules.email.property')
      end
    end

    def description_value(_locale)
      multivalue_predicate? ? value.join(', ') : value
    end

    private

    def needs_value?
      true
    end

    def multivalue_predicate?
      MULTIVALUE_PREDICATES.include?(predicate)
    end

    # Addresses are stored as the user typed them and are only unique on their
    # lowercased form, so matching goes through the `lower(email)` index.
    def normalized_values
      Array(value).filter_map { |email| email.strip.downcase.presence }.uniq
    end

    def validate_value_shape
      if multivalue_predicate?
        if !value.is_a?(Array)
          errors.add(:value, :invalid, message: 'must be an array of email addresses')
        elsif value.size > MAX_VALUES
          errors.add(:value, :too_long, message: "must hold at most #{MAX_VALUES} email addresses")
        end
      elsif value.is_a?(Array)
        errors.add(:value, :invalid, message: 'must be a single email address')
      end
    end
  end
end
