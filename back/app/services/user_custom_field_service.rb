# frozen_string_literal: true

class UserCustomFieldService
  def delete_custom_field_values(field)
    return unless field.resource_type == 'User'

    User
      .where("custom_field_values ? '#{field.key}'")
      .update_all("custom_field_values = custom_field_values - '#{field.key}'")
  end

  def delete_custom_field_option_values(option_key, field)
    return unless field.resource_type == 'User'

    if field.supports_multiple_selection?
      # When option is the only selection
      User
        .where("custom_field_values->>'#{field.key}' = ?", [option_key].to_json)
        .update_all("custom_field_values = custom_field_values - '#{field.key}'")
      # When option was selected amongst other values
      User
        .where("(custom_field_values->>'#{field.key}')::jsonb ? :value", value: option_key)
        .update_all("custom_field_values = jsonb_set(custom_field_values, '{#{field.key}}', (custom_field_values->'#{field.key}') - '#{option_key}')")
    else
      # When single select
      User
        .where("custom_field_values->>'#{field.key}' = ?", option_key)
        .update_all("custom_field_values = custom_field_values - '#{field.key}'")
    end
  end
end
