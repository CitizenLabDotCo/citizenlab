class CustomFieldService
  include CustomFieldUserOverrides

  def initialize
    @multiloc_service = MultilocService.new
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_json_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').each_with_object({}) do |locale, obj|
      obj[locale] = fields_to_json_schema(fields, locale)
    end
  end

  def fields_to_json_schema(fields, locale = "en")
    {
      type: "object",
      additionalProperties: false,
      properties: fields.inject({}) do |memo, field|
        override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
        memo[field.key] =
          if field.code && self.respond_to?(override_method, true)
            send(override_method, field, locale)
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

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_ui_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').inject({}) do |memo, locale|
      memo[locale] = fields_to_ui_schema(fields, locale)
      memo
    end
  end

  def fields_to_ui_schema(fields, locale = "en")
    fields.inject({}) do |memo, field|
      override_method = "#{field.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      memo[field.key] =
        if field.code && self.respond_to?(override_method, true)
          send(override_method, field, locale)
        else
          send("#{field.input_type}_to_ui_schema_field", field, locale)
        end
      memo
    end.tap do |output|
      output['ui:order'] = fields.sort_by { |f| f.ordering || Float::INFINITY }.map(&:key)
    end
  end

  def generate_key(record, title)
    key = keyify(title)
    indexedKey = nil
    i = 0
    # while record.class.find_by(key: indexedKey || key)
    while yield(indexedKey || key)
      i += 1
      indexedKey = [key, '_', i].join
    end
    indexedKey || key
  end

  def keyify(str)
    str.parameterize.gsub(/\-/, '_')
  end

  def cleanup_custom_field_values!(custom_field_values)
    custom_field_values.keys.each do |key|
      if custom_field_values[key].nil?
        custom_field_values.delete key
      end
    end
    custom_field_values
  end

  # @param [Hash<String, _>] custom_field_values
  # @return [Hash<String, _>]
  def self.remove_hidden_custom_fields(custom_field_values)
    # The key to performance here is that the SQL request that gets 'all_hidden_keys' is always the same (it does not
    # depend on the parameters). As a consequence, if this method is called several times for processing a single
    # request, the result of the request is cached and the request is not repeated.
    all_hidden_keys = CustomField.hidden.pluck(:key)
    hidden_keys = all_hidden_keys & custom_field_values.keys
    custom_field_values.except(*hidden_keys)
  end

  # @param [Hash<String, _>] custom_field_values
  # @return [Hash<String, _>]
  def self.remove_disabled_custom_fields(custom_field_values)
    all_disabled_keys = CustomField.disabled.pluck(:key)
    disabled_keys = all_disabled_keys & custom_field_values.keys
    custom_field_values.except(*disabled_keys)
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

  def base_ui_schema_field(field, locale)
    Hash.new.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden' if field.hidden || !field.enabled
    end
  end

# *** text ***

  def text_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def text_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string"
    }
  end

  # *** number ***

  def number_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def number_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "number"
    }
  end
  
  # *** multiline_text ***

  def multiline_text_to_ui_schema_field(field, locale)
    base = base_ui_schema_field(field, locale)
    if base[:"ui:widget"]
      base 
    else
      {"ui:widget": "textarea"}
    end
  end

  def multiline_text_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string"
    }
  end 
  
  # *** select ***

  def select_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def select_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string",
    }.tap do |items|
      options = field.custom_field_options.order(:ordering)
      unless options.empty?
        items[:enum] = options.map(&:key)
        items[:enumNames] = options.map { |o| handle_title(o, locale) }
      end
    end
  end
  
  # *** multiselect ***

  def multiselect_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def multiselect_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "array",
      uniqueItems: true,
      minItems: (field.enabled && field.required) ? 1 : 0,
      items: {
          type: "string",
      }.tap do |items|
        options = field.custom_field_options.order(:ordering)
        unless options.empty?
          items[:enum] = options.map(&:key)
          items[:enumNames] = options.map { |o| handle_title(o, locale) }
        end
      end,
    }
  end 
  
  # *** checkbox ***

  def checkbox_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def checkbox_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "boolean"
    }
  end 
  
  # *** date ***

  def date_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def date_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "string",
      format: "date"
    }
  end

  # *** files ***

  def files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def files_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: "array",
      items: {
        type: "string",
        format: "data-url",
      }
    }
  end

end
