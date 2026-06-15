# frozen_string_literal: true

# Builds the JSON Schema for form fields, parametrized by mode (+:input+ or +:output+).
# In +:output+ mode it includes read-only attrs (+created_at+, +updated_at+,
# +resource_id+); in +:input+ mode it includes +temp_id+ for referencing new records
# from logic rules before save.
class McpServer::Tools::FormFieldsSchemaBuilder
  MODES = %i[input output].freeze

  def initialize(mode:, multiloc_schema:)
    raise ArgumentError, "invalid mode #{mode.inspect}, expected one of #{MODES.inspect}" unless mode.in?(MODES)

    @mode = mode
    @multiloc_schema = multiloc_schema
  end

  def field_schema
    @field_schema ||= {
      type: 'object',
      properties: {
        **id_properties,
        **common_field_properties,
        **output_only_field_properties,
        options: { type: 'array', items: option_schema },
        matrix_statements: { type: 'array', items: matrix_statement_schema }
      }
    }
  end

  def option_schema
    @option_schema ||= {
      type: 'object',
      properties: {
        **id_properties,
        key: { type: 'string' },
        ordering: { type: 'integer' },
        title_multiloc: multiloc_schema,
        image_id: { type: %w[string null] },
        other: {
          type: 'boolean',
          description: 'Marks this as the "Other" free-text fallback option.'
        }
      }
    }
  end

  def matrix_statement_schema
    @matrix_statement_schema ||= {
      type: 'object',
      properties: {
        **id_properties,
        key: { type: 'string' },
        ordering: { type: 'integer' },
        title_multiloc: multiloc_schema
      }
    }
  end

  private

  attr_reader :multiloc_schema

  def input? = @mode == :input

  def id_properties
    if input?
      {
        id: { type: 'string', description: 'UUID for updates. Omit for new records.' },
        temp_id: {
          type: 'string',
          description: 'Handle to reference new records from logic rules. Remapped to real IDs on save.'
        }
      }
    else
      { id: { type: 'string' } }
    end
  end

  def output_only_field_properties
    return {} if input?

    {
      created_at: { type: 'string', description: 'ISO 8601 timestamp.' },
      updated_at: { type: 'string', description: 'ISO 8601 timestamp.' },
      resource_id: { type: 'string', description: 'UUID of the parent CustomForm.' }
    }
  end

  def common_field_properties
    @common_field_properties ||= {
      code: {
        type: %w[string null],
        description: <<~DESC.squish
          Reserved code for built-in fields (e.g. `title_multiloc` on ideation). null for
          custom-added fields. Do not invent codes.
        DESC
      },
      key: {
        type: 'string',
        description: 'Stable slug. Auto-generated from title if omitted on new fields.'
      },
      input_type: {
        type: 'string',
        description: 'Field type. Allowed set depends on the participation method.',
        enum: %w[
          page number linear_scale rating text multiline_text select multiselect
          multiselect_image file_upload shapefile_upload point line polygon
          ranking matrix_linear_scale sentiment_linear_scale
        ]
      },
      title_multiloc: multiloc_schema,
      description_multiloc: { **multiloc_schema, description: 'Localized HTML. On output, embedded image references are resolved to URLs.' },
      required: { type: 'boolean' },
      enabled: { type: 'boolean' },
      ordering: { type: 'integer' },
      random_option_ordering: {
        type: 'boolean',
        description: <<~DESC.squish
          Only for select / multiselect / multiselect_image / ranking. When true, the
          order of options is randomized each time they are displayed ("Other" stays at
          the bottom).
        DESC
      },
      include_in_printed_form: {
        type: 'boolean',
        description: 'Whether the field appears on the printed PDF version of the form.'
      },
      logic: {
        type: 'object',
        description: <<~DESC.squish
          Branching logic. Native survey only. 
          
          Shape on selection fields:
          { "rules": [{ "if": "<option_id|temp_id|'any_other_answer'|'no_answer'>", "goto_page_id": "<page_id|temp_id>" }] }. 
          
          Shape on pages: 
          { "next_page_id": "<page_id|temp_id>" }. 
       
          Temp IDs are remapped to real IDs on save.
        DESC
      },

      # Page-only
      page_layout: {
        type: 'string',
        enum: %w[default map],
        description: <<~DESC.squish
          Only for page. `default` is a plain page break. `map` renders the page with an
          interactive map background, referenced via `map_config_id`.
        DESC
      },
      page_button_link: {
        type: %w[string null],
        description: 'Only for the form_end page. URL the call-to-action button navigates to after submission.'
      },
      page_button_label_multiloc: {
        **multiloc_schema,
        description: 'Only for the form_end page. Label for the call-to-action button.'
      },

      # Select / multiselect family
      dropdown_layout: { type: 'boolean', description: 'Only for select / multiselect. Render as a dropdown rather than radio buttons / checkboxes.' },
      select_count_enabled: { type: 'boolean', description: 'Only for multiselect / multiselect_image. Enable min/max select-count enforcement.' },
      minimum_select_count: { type: 'integer' },
      maximum_select_count: { type: 'integer' },

      # Sentiment
      ask_follow_up: {
        type: 'boolean',
        description: <<~DESC.squish
          Only for sentiment_linear_scale. When true, the participant gets a free-text
          follow-up input after selecting their sentiment.
        DESC
      },

      # Scale family
      maximum: {
        type: 'integer',
        minimum: 2,
        maximum: 11,
        description: <<~DESC.squish
          Only for linear_scale / rating / sentiment_linear_scale / matrix_linear_scale.
          Top of the scale (2..11).
        DESC
      },
      linear_scale_label_1_multiloc: {
        **multiloc_schema,
        description: <<~DESC.squish
          Only for linear_scale / sentiment_linear_scale / matrix_linear_scale. Labels
          1..11 — only indices in 1..maximum are meaningful.
        DESC
      },
      linear_scale_label_2_multiloc: multiloc_schema,
      linear_scale_label_3_multiloc: multiloc_schema,
      linear_scale_label_4_multiloc: multiloc_schema,
      linear_scale_label_5_multiloc: multiloc_schema,
      linear_scale_label_6_multiloc: multiloc_schema,
      linear_scale_label_7_multiloc: multiloc_schema,
      linear_scale_label_8_multiloc: multiloc_schema,
      linear_scale_label_9_multiloc: multiloc_schema,
      linear_scale_label_10_multiloc: multiloc_schema,
      linear_scale_label_11_multiloc: multiloc_schema,

      # Text family
      min_characters: { type: %w[integer null], description: 'Only for text / multiline_text.' },
      max_characters: { type: %w[integer null], description: 'Only for text / multiline_text.' },

      # Geographic
      map_config_id: {
        type: %w[string null],
        description: <<~DESC.squish
          Only for point / line / polygon, and for map-layout pages. UUID of an existing
          CustomMaps::MapConfig. Must reference a MapConfig that already exists.
        DESC
      }
    }
  end
end
