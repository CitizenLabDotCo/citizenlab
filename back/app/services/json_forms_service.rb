# Services to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  include JsonFormsIdeasOverrides
  include JsonFormsUserOverrides

  def initialize
    @multiloc_service = MultilocService.new
  end

  def ui_and_json_multiloc_schemas(configuration, fields, current_user)
    resource_types = fields.map { |f| f.resource_type }.uniq
    raise "Can't render a UI schema for fields belonging to different resource types" unless resource_types.size <= 1
    return nil if resource_types.empty?

    allowed_fields = allowed_fields(configuration, fields, current_user)
    json_schema_multiloc = fields_to_json_schema_multiloc(configuration, allowed_fields)
    ui_schema_multiloc = fields_to_ui_schema_multiloc(configuration, allowed_fields)

    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  private

  def allowed_fields(configuration, fields, current_user)
    override_method = "#{fields.first.resource_type.underscore}_allowed_fields"
    if self.respond_to?(override_method, true)
      send(override_method, configuration, fields, current_user)
    else
      fields
    end
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
      type: 'object',
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
    send("#{fields.first.resource_type.underscore}_to_ui_schema", fields, locale) do |field|
      next nil if (!field || !field.enabled || field.hidden)
      override_method = "#{fields.first.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      if field.code && self.respond_to?(override_method, true)
        send(override_method, field, locale)
      else
        send("#{field.input_type}_to_ui_schema_field", field, locale)
      end
    end
  end

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
      scope: "#/properties/#{field.key}",
      label: handle_title(field, locale),
      options: { description: handle_description(field, locale) },
    }
  end

# *** text ***

  def text_to_ui_schema_field(field, locale)
    {
      **base_ui_schema_field(field, locale),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        transform: 'trim_on_blur'
      }
    }
  end

  def text_to_json_schema_field(field, locale)
    {
      type: 'string'
    }
  end

  # *** number ***

  def number_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def number_to_json_schema_field(field, locale)
    {
      type: 'number'
    }
  end

  # *** multiline_text ***

  def multiline_text_to_ui_schema_field(field, locale)
    {
      **base_ui_schema_field(field, locale),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        textarea: true,
        transform: 'trim_on_blur'
      }
    }
  end

  def multiline_text_to_json_schema_field(field, locale)
    {
      type: 'string'
    }
  end

  # *** html ***

  def html_to_ui_schema_field(field, locale)
    {
      **base_ui_schema_field(field, locale),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        render: 'WYSIWYG'
      }
    }
  end

  def html_to_json_schema_field(field, locale)
    {
      type: 'string'
    }
  end

  # *** text_multiloc ***

  def text_multiloc_to_json_schema_field(field, locale)
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core', 'locales').map do |locale|
        [
          locale,
          {
            type: 'string',
          }
        ]
      end.to_h
    }
  end

  def text_multiloc_to_ui_schema_field(field, locale)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#/properties/#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, description: handle_description(field, locale) },
          label: handle_title(field, locale),
        }
      end
    }
  end

  # *** multiline_text_multiloc ***

  def multiline_text_multiloc_to_json_schema_field(field, locale)
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core', 'locales').map do |locale|
        [
          locale,
          {
            type: 'string',
          }
        ]
      end.to_h
    }
  end

  def multiline_text_multiloc_to_ui_schema_field(field, locale)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#/properties/#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, textarea: true, description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  # *** html_multiloc ***

  def html_multiloc_to_json_schema_field(field, locale)
    {
      type: 'object',
      minProperties: 1,
      properties: AppConfiguration.instance.settings('core', 'locales').map do |locale|
        [
          locale,
          {
            type: 'string',
          }
        ]
      end.to_h
    }
  end

  def html_multiloc_to_ui_schema_field(field, locale)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: AppConfiguration.instance.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#/properties/#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, render: 'WYSIWYG', description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  # *** select ***

  def select_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def select_to_json_schema_field(field, locale)
    {
      type: 'string',
    }.tap do |json|
      options = field.custom_field_options.order(:ordering)
      unless options.empty?
        json[:oneOf] = options.map do |option|
          {
            const: option.key,
            title: handle_title(option, locale)
          }
        end
      end
    end
  end

  # *** multiselect ***

  def multiselect_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def multiselect_to_json_schema_field(field, locale)
    {
      type: 'array',
      uniqueItems: true,
      minItems: (field.enabled && field.required) ? 1 : 0,
      items: {
          type: 'string',
      }.tap do |items|
        options = field.custom_field_options.order(:ordering)
        unless options.empty?
          items[:oneOf] = options.map do |option|
            {
              const: option.key,
              title: handle_title(option, locale)
            }
          end
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
      type: 'boolean'
    }
  end

  # *** date ***

  def date_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def date_to_json_schema_field(field, locale)
    {
      type: 'string',
      format: 'date'
    }
  end

  # *** files ***

  def image_files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def image_files_to_json_schema_field(field, locale)
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
          }
        }
      }
    }
  end

  def files_to_ui_schema_field(field, locale)
    base_ui_schema_field(field, locale)
  end

  def files_to_json_schema_field(field, locale)
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file_by_content: {
            type: 'object',
            properties: {
              file: {
                type: 'string'
              },
              name: {
                type: 'string'
              }
            }
          },
          name: {
            type: 'string'
          }
        }
      }
    }
  end

  def point_to_ui_schema_field(field, locale)
    nil
  end

  def point_to_json_schema_field(field, locale)
    {
      required: ['type', 'coordinates'],
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['Point'],
        },
        coordinates: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'number',
          },
        },
      }
    }
  end

end
