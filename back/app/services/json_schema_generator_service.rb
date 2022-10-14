# frozen_string_literal: true

class JsonSchemaGeneratorService < FieldVisitorService
  def initialize
    super
    configuration = AppConfiguration.instance
    @locales = configuration.settings('core', 'locales')
    @multiloc_service = MultilocService.new app_configuration: @configuration
  end

  def generate_for(fields)
    locales.index_with do |locale|
      I18n.with_locale(locale) do
        generate_for_current_locale fields
      end
    end
  end

  def visit_text(_field)
    { type: 'string' }
  end

  def visit_number(_field)
    { type: 'number' }
  end

  def visit_multiline_text(_field)
    { type: 'string' }
  end

  def visit_html(_field)
    { type: 'string' }
  end

  def visit_text_multiloc(_field)
    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def visit_multiline_text_multiloc(_field)
    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def visit_html_multiloc(_field)
    {
      type: 'object',
      minProperties: 1,
      properties: locales.index_with do |_locale|
        {
          type: 'string'
        }
      end
    }
  end

  def visit_select(field)
    {
      type: 'string'
    }.tap do |json|
      options = field.options.order(:ordering)
      unless options.empty?
        json[:oneOf] = options.map do |option|
          {
            const: option.key,
            title: multiloc_service.t(option.title_multiloc)
          }
        end
      end
    end
  end

  def visit_multiselect(field)
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
              title: multiloc_service.t(option.title_multiloc)
            }
          end
        end
      end
    }
  end

  def visit_checkbox(_field)
    { type: 'boolean' }
  end

  def visit_date(_field)
    {
      type: 'string',
      format: 'date'
    }
  end

  def visit_files(_field)
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

  def visit_image_files(_field)
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

  def visit_point(_field)
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

  def visit_linear_scale(field)
    {
      type: 'number',
      minimum: 1,
      maximum: field.maximum
    }
  end

  private

  attr_reader :locales, :multiloc_service

  def generate_for_current_locale(fields)
    field_properties = fields.each_with_object({}) do |field, accu|
      accu[field.key] = visit field
    end
    {
      type: 'object',
      additionalProperties: false,
      properties: field_properties
    }.tap do |output|
      required = fields.select(&:enabled?).select(&:required?).map(&:key)
      output[:required] = required unless required.empty?
    end
  end
end
