# frozen_string_literal: true

class UserCustomFieldService
  def delete_custom_field_values(field, current_user)
    users = User.where("custom_field_values ? '#{field.key}'")
    log = {}

    users.each do |user|
      log[user.id] = { field.key.to_s => user.custom_field_values[field.key] }
    end

    LogActivityJob.perform_now(
      field,
      'deletion_initiated',
      current_user,
      Time.now.to_i,
      payload: {
        explanation: 'if this deletion succeeded, these users lost this data from custom_field_values',
        log_user_ids_deleted_custom_field_values: log
      }
    )

    users.update_all("custom_field_values = custom_field_values - '#{field.key}'")
  end

  def delete_custom_field_option_values(option_key, field)
    if field.input_type == 'multiselect'
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
