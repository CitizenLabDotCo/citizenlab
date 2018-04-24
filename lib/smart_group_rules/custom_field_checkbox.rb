module SmartGroupRules
  class CustomFieldCheckbox

    PREDICATE_VALUES = %w(is_checked not_is_checked)

    RULE_TYPE = "custom_field_checkbox"

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.where(input_type: 'checkbox').map(&:id) } }

    def self.to_json_schema
      [   
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
              "enum" => PREDICATE_VALUES
            }
          }
        }
      ]
    end

    def initialize custom_field_id, predicate, value=nil
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      # self.value = value
    end

    def filter users_scope
      custom_field = CustomField.find(custom_field_id)
      key = custom_field.key
      if custom_field.input_type == 'checkbox'
        case predicate
        when 'is_checked'
          raise "Unsupported predicate #{predicate}"
        when 'not_is_checked'
          raise "Unsupported predicate #{predicate}"
        else
          raise "Unsupported predicate #{predicate}"
        end
      end
    end

    private

    def needs_value?
      false
    end

  end
end