# Services to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  include JsonFormsIdeasOverrides

  def initialize
    @multiloc_service = MultilocService.new
  end

  def ui_and_json_multiloc_schemas(configuration, fields)
    json_schema_multiloc = fields_to_json_schema_multiloc(configuration, fields)
    ui_schema_multiloc = fields_to_ui_schema_multiloc(configuration, fields)

    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  # @param [AppConfiguration] configuration
  # @return [Hash{String => Object}]
  def fields_to_json_schema_multiloc(configuration, fields)
    configuration.settings('core', 'locales').each_with_object({}) do |locale, obj|
      obj[locale] = fields_to_json_schema(fields, locale)
    end
  end

  def fields_to_json_schema(fields, locale='en')
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

  def fields_to_ui_schema(fields, locale='en')
    ideation_fields_to_ui_schema(fields, locale)
    # fields.inject({}) do |memo, field|
    #   override_method = "#{field.resource_type.underscore}_#{field.code}_to_ui_schema_field"
    #   memo[field.key] =
    #     if field.code && self.respond_to?(override_method, true)
    #       send(override_method, field, locale)
    #     else
    #       send("#{field.input_type}_to_ui_schema_field", field, locale)
    #     end
    #   memo
    # end
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
    {
      type: 'Control',
      label: handle_title(field, locale),
      scope: "#/properties/#{field.key}"
    }
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
      }
    }
  end

end
