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
      options = field.ordered_transformed_options

      unless options.empty?
        json[:enum] = options.map(&:key)
      end
    end
  end

  # Fallback to basic visit_select. Only multi select image currently fully implemented.
  # Field type not used in native surveys, nor in idea forms.
  # To support single select images oneOf will be needed instead of Enum for returning options.
  def visit_select_image(field)
    visit_select(field)
  end

  def visit_multiselect(field)
    {
      type: 'array',
      uniqueItems: true,
      minItems: field.enabled? && field.required? && !field.minimum_select_count? ? 1 : field.minimum_select_count || 0,
      maxItems: field.maximum_select_count || field.options.size,
      items: {
        type: 'string'
      }.tap do |items|
        options = field.ordered_options
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

  def visit_multiselect_image(field)
    select = visit_multiselect(field)
    select[:items].tap do |items|
      options = field.ordered_options
      unless options.empty?
        items[:oneOf] = options.map do |option|
          {
            const: option.key,
            title: multiloc_service.t(option.title_multiloc),
            image: option.image&.image&.versions&.transform_values(&:url)
          }
        end
      end
    end
    select
  end

  def visit_ranking(field)
    visit_multiselect(field).tap do |schema_item|
      schema_item[:minItems] = field.options.size
      schema_item[:maxItems] = field.options.size
    end
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
          const: 'Point'
        },
        coordinates: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: {
            type: 'number'
          }
        }
      }
    }
  end

  def visit_line(_field)
    {
      required: %w[type coordinates],
      type: 'object',
      properties: {
        type: {
          const: 'LineString'
        },
        coordinates: {
          type: 'array',
          minItems: 2,
          items: {
            type: 'array',
            minItems: 2,
            maxItems: 2,
            items: {
              type: 'number'
            }
          }
        }
      }
    }
  end

  def visit_polygon(_field)
    {
      required: %w[type coordinates],
      type: 'object',
      properties: {
        type: {
          const: 'Polygon'
        },
        coordinates: {
          type: 'array',
          items: {
            type: 'array',
            minItems: 4,
            items: {
              type: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                type: 'number'
              }
            }
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

  def visit_sentiment_linear_scale(_field)
    {
      type: 'number',
      minimum: 1,
      maximum: 5
    }
  end

  def visit_rating(field)
    {
      type: 'number',
      minimum: 1,
      maximum: field.maximum
    }
  end

  def visit_file_upload(_field)
    {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        content: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      }
    }
  end

  def visit_shapefile_upload(field)
    visit_file_upload(field)
  end

  def visit_matrix_linear_scale(field)
    {
      type: 'object',
      minProperties: (field.required ? field.matrix_statement_ids.size : 0),
      maxProperties: field.matrix_statement_ids.size,
      properties: field.matrix_statements.pluck(:key).map(&:to_sym).index_with do
        {
          type: 'number',
          minimum: 1,
          maximum: field.maximum
        }
      end
    }
  end

  private

  attr_reader :locales, :multiloc_service

  def generate_for_current_locale(fields)
    field_properties = fields.each_with_object({}) do |field, accu|
      field_schema = visit field
      next unless field_schema

      accu[field.key] = field_schema
      accu[field.other_option_text_field.key] = visit(field.other_option_text_field) if field.other_option_text_field
      accu[field.follow_up_text_field.key] = visit(field.follow_up_text_field) if field.follow_up_text_field
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
