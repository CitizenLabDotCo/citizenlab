class CustomFieldService

  def initialize
    @multiloc_service = MultilocService.new
  end

  def fields_to_json_schema fields, locale="en"
    {
      type: "object",
      additionalProperties: false,
      properties: fields.inject({}) do |memo, field|
        memo[field.key] = send("#{field.input_type}_to_json_schema_field", field, locale)
        memo
      end
    }.tap do |output|
      required = fields.select(&:required).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  def fields_to_ui_schema fields, locale="en"
    fields.inject({}) do |memo, field|
      memo[field.key] = send("#{field.input_type}_to_ui_schema_field", field, locale)
      memo
    end.tap do |output|
      output['ui:order'] = fields.sort_by(&:ordering).map(&:key)
    end
  end

  private

  def handle_description(field, locale)
    field.description_multiloc[locale] || ""
  end

  def handle_title(field, locale)
    field.title_multiloc[locale] || ""
  end

# *** text ***

  def text_to_ui_schema_field field, locale
    {}
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
    {"ui:widget": "textarea"}
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
    {}
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
    {}
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
      minItems: field.required ? 1 : 0
    }
  end 
  
  # *** checkbox ***

  def checkbox_to_ui_schema_field field, locale
    {}
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
    {}
  end

  def date_to_json_schema_field field, locale
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string",
      format: "date"
    }
  end

end