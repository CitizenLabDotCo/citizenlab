# frozen_string_literal: true

# Services to generate a json schema and UI schema for a CustomForm, compatible
# with jsonforms.io.
class JsonFormsService
  include JsonFormsIdeasOverrides
  include JsonFormsUserOverrides

  def initialize
    @configuration = AppConfiguration.instance
    @multiloc_service = MultilocService.new app_configuration: @configuration
  end

  def ui_and_json_multiloc_schemas(fields, current_user)
    resource_types = fields.map(&:resource_type).uniq
    raise "Can't render a UI schema for fields belonging to different resource types" if resource_types.many?
    return nil if resource_types.empty?

    allowed_fields = allowed_fields(fields, current_user)
    json_schema_multiloc = fields_to_json_schema_multiloc(allowed_fields)
    ui_schema_multiloc = fields_to_ui_schema_multiloc(allowed_fields)

    { json_schema_multiloc: json_schema_multiloc, ui_schema_multiloc: ui_schema_multiloc }
  end

  private

  def allowed_fields(fields, current_user)
    override_method = "#{fields.first.resource_type.underscore}_allowed_fields"
    if respond_to?(override_method, true)
      send(override_method, fields, current_user)
    else
      fields
    end
  end

  def fields_to_json_schema_multiloc(fields)
    @configuration.settings('core', 'locales').index_with do |locale|
      override_method = "#{fields.first.resource_type.underscore}_to_json_schema"
      if respond_to?(override_method, true)
        send(override_method, fields, locale)
      else
        fields_to_json_schema(fields, locale)
      end
    end
  end

  def fields_to_json_schema(fields, locale = 'en')
    {
      type: 'object',
      additionalProperties: false,
      properties: fields.each_with_object({}) do |field, accu|
        override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
        accu[field.key] = if field.code && respond_to?(override_method, true)
          send(override_method, field, locale)
        else
          send("#{field.input_type}_to_json_schema_field", field, locale)
        end
      end
    }.tap do |output|
      required = fields.select(&:enabled?).select(&:required?).map(&:key)
      output[:required] = required unless required.empty?
    end
  end

  def fields_to_ui_schema_multiloc(fields)
    @configuration.settings('core', 'locales').index_with do |locale|
      fields_to_ui_schema(fields, locale)
    end
  end

  def fields_to_ui_schema(fields, locale = 'en')
    send("#{fields.first.resource_type.underscore}_to_ui_schema", fields, locale) do |field, previous_scope|
      next nil if !field || !field.enabled? || field.hidden?

      override_method = "#{fields.first.resource_type.underscore}_#{field.code}_to_ui_schema_field"
      if field.code && respond_to?(override_method, true)
        send(override_method, field, locale, previous_scope)
      else
        send("#{field.input_type}_to_ui_schema_field", field, locale, previous_scope)
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

  def base_ui_schema_field(field, locale, previous_scope = nil)
    {
      type: 'Control',
      scope: "#{previous_scope || '#/properties/'}#{field.key}",
      label: handle_title(field, locale),
      options: { description: handle_description(field, locale) }
    }
  end

  # *** text ***

  def text_to_ui_schema_field(field, locale, previous_scope)
    {
      **base_ui_schema_field(field, locale, previous_scope),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        transform: 'trim_on_blur'
      }
    }
  end

  def text_to_json_schema_field(_field, _locale)
    {
      type: 'string'
    }
  end

  # *** number ***

  def number_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def number_to_json_schema_field(_field, _locale)
    {
      type: 'number'
    }
  end

  # *** multiline_text ***

  def multiline_text_to_ui_schema_field(field, locale, previous_scope)
    {
      **base_ui_schema_field(field, locale, previous_scope),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        textarea: true,
        transform: 'trim_on_blur'
      }
    }
  end

  def multiline_text_to_json_schema_field(_field, _locale)
    {
      type: 'string'
    }
  end

  # *** html ***

  def html_to_ui_schema_field(field, locale, previous_scope)
    {
      **base_ui_schema_field(field, locale, previous_scope),
      options: {
        **base_ui_schema_field(field, locale)[:options],
        render: 'WYSIWYG'
      }
    }
  end

  def html_to_json_schema_field(_field, _locale)
    {
      type: 'string'
    }
  end

  # *** text_multiloc ***

  def text_multiloc_to_json_schema_field(_field, _locale)
    {
      type: 'object',
      minProperties: 1,
      properties: @configuration.settings('core', 'locales').index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def text_multiloc_to_ui_schema_field(field, locale, previous_scope)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: @configuration.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#{previous_scope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  # *** multiline_text_multiloc ***

  def multiline_text_multiloc_to_json_schema_field(_field, _locale)
    {
      type: 'object',
      minProperties: 1,
      properties: @configuration.settings('core', 'locales').index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def multiline_text_multiloc_to_ui_schema_field(field, locale, previous_scope)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: @configuration.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#{previous_scope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, textarea: true, description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  # *** html_multiloc ***

  def html_multiloc_to_json_schema_field(_field, _locale)
    {
      type: 'object',
      minProperties: 1,
      properties: @configuration.settings('core', 'locales').index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def html_multiloc_to_ui_schema_field(field, locale, previous_scope)
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: @configuration.settings('core', 'locales').map do |map_locale|
        {
          type: 'Control',
          scope: "#{previous_scope || '#/properties/'}#{field.key}/properties/#{locale}",
          options: { locale: map_locale, trim_on_blur: true, render: 'WYSIWYG', description: handle_description(field, locale) },
          label: handle_title(field, locale)
        }
      end
    }
  end

  # *** select ***

  def select_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def select_to_json_schema_field(field, locale)
    {
      type: 'string'
    }.tap do |json|
      options = field.options.order(:ordering)
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

  def multiselect_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def multiselect_to_json_schema_field(field, locale)
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? ? 1 : 0,
      items: {
        type: 'string'
      }.tap do |items|
        options = field.options.order(:ordering)
        unless options.empty?
          items[:oneOf] = options.map do |option|
            {
              const: option.key,
              title: handle_title(option, locale)
            }
          end
        end
      end
    }
  end

  # *** checkbox ***

  def checkbox_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def checkbox_to_json_schema_field(_field, _locale)
    {
      type: 'boolean'
    }
  end

  # *** date ***

  def date_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def date_to_json_schema_field(_field, _locale)
    {
      type: 'string',
      format: 'date'
    }
  end

  # *** files ***

  def image_files_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def image_files_to_json_schema_field(_field, _locale)
    {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image: {
            type: 'string'
          }
        }
      }
    }
  end

  def files_to_ui_schema_field(field, locale, previous_scope)
    base_ui_schema_field(field, locale, previous_scope)
  end

  def files_to_json_schema_field(_field, _locale)
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

  def point_to_ui_schema_field(_field, _locale, _previous_scope)
    nil
  end

  def point_to_json_schema_field(_field, _locale)
    {
      required: %w[type coordinates],
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['Point']
        },
        coordinates: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'number'
          }
        }
      }
    }
  end
end
