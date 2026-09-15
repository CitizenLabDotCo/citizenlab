# frozen_string_literal: true

# Validates custom_field_values against the JSON schemas of the custom fields,
# as provided by the input type strategies. Required fields are not enforced.
class CustomFieldValuesValidationService
  def json_schema_validation_errors(fields, values)
    JSON::Validator.fully_validate(json_schema(fields), values, errors_as_objects: true).map do |error|
      { fragment: error[:fragment], error: error[:failed_attribute], human_message: error[:message] }
    end
  end

  private

  # Companion answers (_other and _follow_up) are stored under their own keys.
  def json_schema(fields)
    {
      type: 'object',
      additionalProperties: false,
      properties: fields.each_with_object({}) do |field, properties|
        properties[field.key] = field.input_type_strategy.json_schema
        properties["#{field.key}_other"] = { type: 'string' } if field.includes_other_option?
        properties["#{field.key}_follow_up"] = { type: 'string' } if field.ask_follow_up?
      end
    }
  end
end
