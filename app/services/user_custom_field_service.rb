class UserCustomFieldService

  def delete_custom_field_values field
    User
      .where("custom_field_values \? '#{field.key}'")
      .update_all("custom_field_values = custom_field_values - '#{field.key}'")
  end

  def delete_custom_field_option_values option_key, field
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

  private

  # *** Built-in birthyear field ***

  def birthyear_to_json_schema_field field, locale
    normal_field = number_to_json_schema_field(field, locale)
    normal_field[:enum] = (1900..(Time.now.year - 12)).to_a.reverse
    normal_field
  end

  def birthyear_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  # *** Built-in domicile field ***

  def domicile_to_json_schema_field field, locale
    normal_field = select_to_json_schema_field(field, locale)
    areas = Area.all.order(created_at: :desc)
    normal_field[:enum] = areas.map(&:id).push('outside')
    I18n.with_locale(locale) do
      normal_field[:enumNames] = areas.map do |area|
        @multiloc_service.t(area.title_multiloc)
      end.push(I18n.t('custom_field_options.domicile.outside'))
    end
    normal_field
  end

  def domicile_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end
end