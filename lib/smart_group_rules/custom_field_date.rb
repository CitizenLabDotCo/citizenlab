module SmartGroupRules
  class CustomFieldDate

    PREDICATE_VALUES = %w(is_before is_exactly is_after is_empty not_is_empty)
    VALUELESS_PREDICATES = %w(is_empty not_is_empty)

    RULE_TYPE = "custom_field_date"

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.where(input_type: 'date').map(&:id) } }
    validates :value, inclusion: { in: -> (record) { CustomFieldOption.where(custom_field_id: record.custom_field_id).map(&:id) } }, if: :needs_value?

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
              "$ref": "#/definitions/customFieldOptionId"
            }
          },
        },
        {
          "type" => "object",
          "required" => ["ruleType", "customFieldId", "predicate"],
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
      if custom_field.input_type == 'select'
        case predicate
        when 'is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NULL")
        when 'not_is_empty'
          users_scope.where("custom_field_values->>'#{key}' IS NOT NULL")
        else
          raise "Unsupported predicate #{predicate}"
        end
      end
    end

    private

    def needs_value?
      !VALUELESS_PREDICATES.include?(predicate)
    end

  end
end