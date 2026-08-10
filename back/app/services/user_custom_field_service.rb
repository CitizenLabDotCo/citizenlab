# frozen_string_literal: true

class UserCustomFieldService
  def delete_custom_field_values(field)
    case field.resource_type
    when 'User'
      delete_key_from_values(User.all, field.key)
      delete_key_from_values(Idea.all, UserFieldsInFormService.prefix_key(field.key))
    when 'CustomForm'
      delete_key_from_values(form_inputs(field.resource), field.key)
    end
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

  private

  def form_inputs(custom_form)
    context = custom_form.participation_context
    if context.is_a?(Phase)
      Idea.where(creation_phase_id: context.id)
    else
      Idea.where(project_id: context.id)
    end
  end

  def delete_key_from_values(scope, key)
    scope
      .where("custom_field_values ? '#{key}'")
      .update_all("custom_field_values = custom_field_values - '#{key}'")
  end
end
