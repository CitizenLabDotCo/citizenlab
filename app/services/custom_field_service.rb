class CustomFieldService

  def initialize
    @multiloc_service = MultilocService.new
  end

  def fields_to_json_schema_multiloc tenant, fields
    tenant.settings.dig('core', 'locales').inject({}) do |memo, locale|
      memo[locale] = fields_to_json_schema(fields, locale)
      memo
    end
  end

  def fields_to_json_schema fields, locale="en"
    {
      type: "object",
      additionalProperties: false,
      properties: fields.inject({}) do |memo, field|
        memo[field.key] = 
          if field.code && self.respond_to?("#{field.key}_to_json_schema_field", true)
            send("#{field.key}_to_json_schema_field", field, locale)
          else
            send("#{field.input_type}_to_json_schema_field", field, locale)
          end
        memo
      end
    }.tap do |output|
      required = fields.select(&:enabled).select(&:required).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  def fields_to_ui_schema_multiloc tenant, fields
    tenant.settings.dig('core', 'locales').inject({}) do |memo, locale|
      memo[locale] = fields_to_ui_schema(fields, locale)
      memo
    end
  end

  def fields_to_ui_schema fields, locale="en"
    fields.inject({}) do |memo, field|
      memo[field.key] = 
        if field.code && self.respond_to?("#{field.key}_to_ui_schema_field", true)
          send("#{field.key}_to_ui_schema_field", field, locale)
        else
          send("#{field.input_type}_to_ui_schema_field", field, locale)
        end
      memo
    end.tap do |output|
      output['ui:order'] = fields.sort_by{|f| f.ordering || Float::INFINITY }.map(&:key)
    end
  end

  def delete_custom_field_values field
    User
      .where("custom_field_values \? '#{field.key}'")
      .update_all("custom_field_values = custom_field_values - '#{field.key}'")
  end

  private

  def handle_description(field, locale)
    I18n.with_locale(locale) do
      @multiloc_service.t(field.description_multiloc)
    end
  end

  def handle_title(field, locale)
    I18n.with_locale(locale) do
      @multiloc_service.t(field.title_multiloc)
    end
  end

  def base_ui_schema_field field, locale
    field.enabled ? {} : {"ui:widget": 'hidden'}
  end

# *** text ***

  def text_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  def text_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string"
    }
  end 
  
  # *** multiline_text ***

  def multiline_text_to_ui_schema_field field, locale
    base = base_ui_schema_field(field, locale)
    if base[:"ui:widget"]
      base 
    else
      {"ui:widget": "textarea"}
    end
  end

  def multiline_text_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string"
    }
  end 
  
  # *** select ***

  def select_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  def select_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string",
      enum: field.custom_field_options.map(&:key),
      enumNames: field.custom_field_options.map{|o| handle_title(o, locale)}
    }
  end
  
  # *** multiselect ***

  def multiselect_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  def multiselect_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "array",
      uniqueItems: true,
      items: {
        type: "string",
        enum: field.custom_field_options.map(&:key),
        enumNames: field.custom_field_options.map{|o| handle_title(o, locale)}
      },
      minItems: (field.enabled && field.required) ? 1 : 0
    }
  end 
  
  # *** checkbox ***

  def checkbox_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  def checkbox_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "boolean"
    }
  end 
  
  # *** date ***

  def date_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  def date_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string",
      format: "date"
    }
  end

  # *** Built-in birthyear field ***

  def birthyear_to_json_schema_field field, locale
    normal_field = select_to_json_schema_field(field, locale)
    normal_field[:enum] = (1900..(Time.now.year - 12)).to_a.reverse.map(&:to_s)
    normal_field
  end

  def birthyear_to_ui_schema_field field, locale
    base_ui_schema_field(field, locale)
  end

  # *** Built-in domicile field ***

  def domicile_to_json_schema_field field, locale
    normal_field = select_to_json_schema_field(field, locale)
    areas = Area.all
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