# frozen_string_literal: true

# Builds the JSON Schema for form fields, parametrized by mode (+:input+ or +:output+).
# In +:output+ mode it includes read-only attrs (+created_at+, +updated_at+,
# +resource_id+); in +:input+ mode it includes +temp_id+ for referencing new records
# from logic rules before save.
class McpServer::Tools::FormFieldsSchemaBuilder
  MODES = %i[input output].freeze

  def initialize(mode:, tenant_locales:)
    raise ArgumentError, "invalid mode #{mode.inspect}, expected one of #{MODES.inspect}" unless mode.in?(MODES)

    @mode = mode
    @tenant_locales = tenant_locales
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
        image_id: {
          type: %w[string null],
          description: <<~DESC.squish
            ID of an existing CustomFieldOptionImage. Only for multiselect_image
            options. There is currently no MCP tool to create option images; the
            only valid values are IDs already present on options (as seen in
            `get_form_fields` output). Omit or pass null for new options.
          DESC
        },
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

  attr_reader :tenant_locales

  def input? = @mode == :input

  def multiloc_schema
    @multiloc_schema ||= {
      type: 'object',
      description: <<~DESC.squish,
        Localized text. An object mapping locale codes to their translations. The tenant's
        active locales are #{tenant_locales.join(', ')}.
      DESC
      additionalProperties: { type: 'string' }
    }
  end

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

    # `created_at`/`updated_at` are null for default forms (fields returned from
    # `default_fields` are unsaved `CustomField.new(...)` objects).`resource_id`
    # is nil only when the parent `CustomForm` itself was never saved either
    # (a never-touched form, before its first save).
    {
      created_at: { type: %w[string null], description: 'ISO 8601 timestamp.' },
      updated_at: { type: %w[string null], description: 'ISO 8601 timestamp.' },
      resource_id: { type: %w[string null], description: 'UUID of the parent CustomForm.' }
    }
  end

  def common_field_properties
    @common_field_properties ||= {
      code: {
        type: %w[string null],
        # Also includes user-profile codes, but it should not be a problem. They just
        # won't show up in responses.
        enum: [*CustomField::CODES, nil],
        description: <<~DESC.squish
          Reserved code for built-in fields. On existing fields, echo the code received 
          from get_form_fields or omit it. When creating a new field, use null.
        DESC
      },
      key: {
        type: %w[string null],
        description: <<~DESC.squish
          Stable slug. Auto-generated from title if omitted on new fields. null for page
          break fields.
        DESC
      },
      input_type: {
        type: 'string',
        description: <<~DESC,
          Field type. Each participation method allows a specific set of input_types
          for new (custom) fields:

          - native_survey: page, number, linear_scale, rating, text, multiline_text,
            select, multiselect, multiselect_image, file_upload, shapefile_upload,
            point, line, polygon, ranking, matrix_linear_scale, sentiment_linear_scale
          - ideation: page, number, linear_scale, rating, text, multiline_text,
            select, multiselect, multiselect_image, ranking, sentiment_linear_scale,
            matrix_linear_scale

          The types text_multiloc, html_multiloc, image_files, files, topic_ids, and
          cosponsor_ids are reserved for built-in fields (identified by a non-null
          `code`) and cannot be used for new fields.
        DESC
        enum: %w[
          page number linear_scale rating text multiline_text select multiselect
          multiselect_image file_upload shapefile_upload point line polygon
          ranking matrix_linear_scale sentiment_linear_scale

          text_multiloc html_multiloc image_files files topic_ids
        ]
      },
      title_multiloc: multiloc_schema,
      description_multiloc: { **multiloc_schema, description: 'Localized HTML. On output, embedded image references are resolved to URLs.' },
      required: { type: 'boolean' },
      enabled: { type: 'boolean' },
      # null only for the form_end page on a default (unsaved) form.
      ordering: {
        type: %w[integer null],
        description: 'Position in the form.'
      },
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
      minimum_select_count: { type: %w[integer null] },
      maximum_select_count: { type: %w[integer null] },

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
        minimum: CustomField::LINEAR_SCALE_MAX_RANGE.min,
        maximum: CustomField::LINEAR_SCALE_MAX_RANGE.max,
        description: <<~DESC.squish
          Only for linear_scale / rating / sentiment_linear_scale / matrix_linear_scale.
          The scale runs from 1 to this value; label slots beyond it are ignored. Set
          labels for the slots in use using `linear_scale_label_<n>_multiloc` attributes.
        DESC
      },
      linear_scale_label_1_multiloc: multiloc_schema,
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
