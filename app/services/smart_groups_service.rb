class SmartGroupsService

  RULE_TYPE_TO_CLASS = [
    SmartGroupRules::CustomFieldText,
    SmartGroupRules::CustomFieldSelect,
    SmartGroupRules::CustomFieldCheckbox,
    SmartGroupRules::CustomFieldDate,
    SmartGroupRules::Role,
    SmartGroupRules::Email,
    SmartGroupRules::LivesIn
  ].map do |smart_group_class|
    [smart_group_class::RULE_TYPE, smart_group_class]
  end.to_h

  def filter users_scope, json_rules
    rules = parse_json_rules json_rules
    result = rules.inject(users_scope) do |memo, rule|
      rule.filter(memo)
    end
  end

  def generate_rules_json_schema
    {
      "description" => "Schema for validating the rules used in smart groups",
      "type" => "array",
      "items" => {
        "anyOf" => each_rule.flat_map do |rule_claz|
          rule_claz.to_json_schema
        end
      },
      "definitions" => {
        "uuid" => {
          "type" => "string",
          "pattern" => "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
        },
        "customFieldId" => {
          "description" => "The ID of a custom field",
          "$ref" => "#/definitions/uuid"
        },
        "customFieldOptionId" => {
          "description" => "The ID of a custom field option",
          "$ref" => "#/definitions/uuid"
        }
      }
    }
  end

  private

  def each_rule
    RULE_TYPE_TO_CLASS.values.each
  end

  def rule_type_to_class rule_type
    RULE_TYPE_TO_CLASS[rule_type]
  end

  def parse_json_rules json_rules
    json_rules.map do |json_rule|
      rule_class = rule_type_to_class(json_rule['ruleType'])
      rule_class.from_json(json_rule)
    end
  end



end




# - custom_field_text
#   is
#   not_not
#   contains
#   not_contains
#   begins_with
#   not_begins_with
#   ends_on
#   not_ends_on
#   is_empty
#   not_is_empty

# - custom_field_select
#   has_value
#   not_has_value
#   is_empty
#   not_is_empty
  
# (- custom_field_number)

# - custom_field_checkbox
#   is_checked
#   not_is_checked

# - custom_field_date
#   is_before
#   is_exactly
#   is_after
#   is_empty
#   not_is_empty

# - email
#   {text_options}

# - lives_in
#   {custom_field_select options}

# - registration_completed_at
#   {custom_field_date_options}








# {
#   ruleType: 'custom_field_text',
#   custom_field_id: '123121-23424234234-2443',
#   predicate: 'contains',
#   value: 'Jozef'
# },
# {
#   ruleType: 'email',
#   predicate: 'ends_on',
#   value: 'citizenlab.co'
# },