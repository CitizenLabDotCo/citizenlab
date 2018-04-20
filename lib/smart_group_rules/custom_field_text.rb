module SmartGroupRules
  class CustomFieldText

    PREDICATE_VALUES = %w(is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)
    RULE_TYPE = "custom_field_text"

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.where(input_type: 'text').map(&:id) } }

    def self.to_json_schema
      [   
        {
          "type": "object",
          "required" => ["ruleType", "customFieldId", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "customFieldId" => {
              "$ref": "#/definitions/customFieldId"
            },
            "predicate" => {
              "type": "string",
              "enum": PREDICATE_VALUES - VALUELESS_PREDICATES,
            },
            "value" => {
              "type" => "string",
            }
          },
        },
        {
          "type" => "object",
          "required" => ["ruleType", "customFieldId", "predicate", "value"],
          "additionalProperties" => false,
          "properties" => {
            "ruleType" => {
              "type" => "string",
              "enum" => [RULE_TYPE],
            },
            "customFieldId" => {
              "$ref": "#/definitions/customFieldId"
            },
            "predicate" => {
              "type" => "string",
              "enum" => VALUELESS_PREDICATES
            }
          }
        }
      ]
    end

    def initialize custom_field_id, predicate, value=nil
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      custom_field = CustomField.find(custom_field_id)
      key = custom_field.key
      case predicate
      when 'is'
        users_scope.where("custom_field_values->>'#{key}' = ?", value)
      when 'not_is'
        users_scope.where("custom_field_values->>'#{key}' <> ?", value)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    private

    def needs_value?
      !VALUELESS_PREDICATES.include?(predicate)
    end

  end
end