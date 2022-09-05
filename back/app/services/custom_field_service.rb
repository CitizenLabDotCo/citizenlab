# frozen_string_literal: true

class CustomFieldService
  include CustomFieldUserOverrides

  def initialize
    @multiloc_service = MultilocService.new app_configuration: AppConfiguration.instance
  end

  def ui_and_json_multiloc_schemas(configuration, fields)
    json_schema_multiloc = fields_to_json_schema_multiloc(configuration, fields)
    ui_schema_multiloc = fields_to_ui_schema_multiloc(configuration, fields)

    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_json_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').index_with do |locale|
      fields_to_json_schema(fields, locale)
    end
  end

  def fields_to_json_schema(fields, locale = 'en')
    {
      type: 'object',
      additionalProperties: false,
      properties: fields.each_with_object({}) do |field, memo|
        override_method_code = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
        override_method_type = "#{field.resource_type.underscore}_#{field.input_type}_to_json_schema_field"
        memo[field.key] =
          if field.code && respond_to?(override_method_code, true)
            send(override_method_code, field, locale)
          elsif field.input_type && respond_to?(override_method_type, true)
            send(override_method_type, field, locale)
          else
            send("#{field.input_type}_to_json_schema_field", field, locale)
          end
      end
    }.tap do |output|
      required = fields.select(&:enabled?).select(&:required?).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_ui_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').index_with do |locale|
      fields_to_ui_schema(fields, locale)
    end
  end

  def fields_to_ui_schema(fields, locale = 'en')
    fields.each_with_object({}) do |field, memo|
      override_method = "#{field.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      memo[field.key] =
        if field.code && respond_to?(override_method, true)
          send(override_method, field, locale)
        else
          send("#{field.input_type}_to_ui_schema_field", field, locale)
        end
    end.tap do |output|
      output['ui:order'] = fields.sort_by { |f| f.ordering || Float::INFINITY }.map(&:key)
    end
  end

  def generate_key(_record, title)
    key = keyify(title)
    indexed_key = nil
    i = 0
    # while record.class.find_by(key: indexed_key || key)
    while yield(indexed_key || key)
      i += 1
      indexed_key = [key, '_', i].join
    end
    indexed_key || key
  end

  def keyify(str)
    str.parameterize.tr('-', '_').presence || '_'
  end

  def cleanup_custom_field_values!(custom_field_values)
    custom_field_values.each_key do |key|
      value = custom_field_values[key]
      is_boolean = !!value == value
      next if is_boolean || value.present?

      custom_field_values.delete key
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

  def base_ui_schema_field(field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden' if field.hidden? || !field.enabled?
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
      type: 'string'
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
      type: 'number'
    }
  end

  # *** multiline_text ***

  def multiline_text_to_ui_schema_field(field, locale)
    base = base_ui_schema_field(field, locale)
    if base[:'ui:widget']
      base
    else
      { 'ui:widget': 'textarea' }
    end
  end

  def multiline_text_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
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
      type: 'string'
    }.tap do |items|
      options = field.options.order(:ordering)
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
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }.tap do |items|
        options = field.options.order(:ordering)
        unless options.empty?
          items[:enum] = options.map(&:key)
          items[:enumNames] = options.map { |o| handle_title(o, locale) }
        end
      end
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
      type: 'boolean'
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
      type: 'string',
      format: 'date'
    }
  end

  # Methods here are not really used to render the fields on the front-end, only description hidden and required are used

  # *** html ***

  def html_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def html_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** text_multiloc ***

  def text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def text_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** multiline_text_multiloc ***

  def multiline_text_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def multiline_text_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** html_multiloc ***

  def html_multiloc_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def html_multiloc_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end

  # *** point ***

  def point_to_ui_schema_field(_field, _locale)
    {}.tap do |ui_schema|
      ui_schema[:'ui:widget'] = 'hidden'
    end
  end

  def point_to_json_schema_field(_field, _locale)
    {
      type: 'string'
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
      type: 'array',
      items: {
        type: 'string',
        format: 'data-url'
      }
    }
  end

  # *** image files ***

  def image_files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def image_files_to_json_schema_field(field, locale)
    {
      title: handle_title(field, locale),
      description: handle_description(field, locale),
      type: 'string'
    }
  end
end
