module SmartGroupRules
  class LivesIn
    include ActiveModel::Validations
    include DescribableRule

    PREDICATE_VALUES = %w(has_value not_has_value is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)

    attr_accessor :predicate, :value

    validates :predicate, presence: true
    validates :predicate, inclusion: { in: PREDICATE_VALUES }
    validates :value, absence: true, unless: :needs_value?
    validates :value, presence: true, inclusion: { in: -> (record) { ['outside'] + Area.all.map(&:id) } }, if: :needs_value?

    def self.to_json_schema
      [   
        {
          "type": "object",
          "required" => ["ruleType", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [rule_type],
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES - VALUELESS_PREDICATES,
            },
            "value" => {
              "description" => "The id of an area",
              "type" => "string"
            }
          },
        },
        {
          "type" => "object",
          "required" => ["ruleType", "predicate"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [rule_type],
            },
            "predicate" => {
              "type" => "string",
              "enum" => VALUELESS_PREDICATES
            }
          }
        }
      ]
    end

    def self.rule_type
      'lives_in'
    end

    def self.from_json json
      self.new(json['predicate'], json['value'])
    end

    def initialize predicate, value=nil
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      case predicate
      when 'has_value'
        users_scope.where("custom_field_values->>'domicile' = ?", value)
      when 'not_has_value'
        users_scope.where("custom_field_values->>'domicile' IS NULL or custom_field_values->>'domicile' != ?", value)
      when 'is_empty'
        users_scope.where("custom_field_values->>'domicile' IS NULL")
      when 'not_is_empty'
        users_scope.where("custom_field_values->>'domicile' IS NOT NULL")     
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    def description_multiloc
      case value
      when 'outside'
        I18n.t("smart_group_rules.lives_in.#{predicate}_outside")
      else
        super
      end
    end

    def description_property locale: nil
        CustomField.find_by(key: 'domicile').title_multiloc[locale]
      end

    def description_rule_type
      case value
      when 'outside'
        rule_type
      else
        SmartGroupRules::CustomFieldSelect.rule_type
      end
    end

    def description_value locale: nil
      case value
      when 'outside'
        value
      else
        Area.find(value).title_multiloc[locale]
      end
    end


    private

    def needs_value?
      !VALUELESS_PREDICATES.include?(predicate)
    end

  end
end