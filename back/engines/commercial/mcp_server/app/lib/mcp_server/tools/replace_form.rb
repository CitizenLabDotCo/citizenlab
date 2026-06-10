# frozen_string_literal: true

class McpServer::Tools::ReplaceForm < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'replace_form'

  def description
    <<~DESC.squish
      Replaces the form attached to a native_survey phase or ideation project. The fields
      array is the complete new form — any existing field whose id is not in the array is
      deleted. New fields are created (use temp_id to reference them from logic rules).
      Refuses if any responses (ideas) exist on the container. Call get_form first to see
      the current shape and the participation method's constraints.
    DESC
  end

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINER_TYPES.keys, description: "'phase' for native_survey, 'project' for ideation." },
        container_id: { type: 'string', description: 'ID of the phase or project.' },
        fields: {
          type: 'array',
          description: 'Complete ordered list of form fields. Order in the array is the form order.',
          items: field_schema
        },
        print_start_multiloc: { **multiloc_schema, description: 'Intro text shown at the top of the printed form (HTML). Optional.' },
        print_end_multiloc: { **multiloc_schema, description: 'Outro / thank-you text at the bottom of the printed form (HTML). Optional.' },
        print_personal_data_fields: { type: 'boolean', description: 'Whether to include personal-data fields in the printed form. Optional.' },
        fields_last_updated_at: {
          type: 'string',
          description: 'Optional stale-data guard. If set, the call fails when the form was modified server-side after this timestamp.'
        }
      },
      required: %w[container_type container_id fields]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    CONTAINER_TYPES = McpServer::Tools::ReplaceForm::CONTAINER_TYPES
    SUPPORTED_METHODS = McpServer::Tools::ReplaceForm::SUPPORTED_METHODS

    def run
      container = CONTAINER_TYPES.fetch(params[:container_type]).find(params[:container_id])
      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      if container.ideas_count.to_i.positive?
        return error(
          "Cannot replace form: #{container.ideas_count} response(s) already submitted to this " \
          "#{params[:container_type]}. Replacing the form would orphan their answers."
        )
      end

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      assign_print_metadata(custom_form)
      custom_form.save! if custom_form.changed? || custom_form.new_record?

      result = IdeaCustomFields::UpdateAllService.new(
        custom_form,
        current_user,
        custom_fields: deep_stringify_field_keys(params[:fields]),
        fields_last_updated_at: params[:fields_last_updated_at],
        form_save_type: 'manual',
        form_opened_at: nil
      ).update_all

      if result.success?
        custom_form.reload
        fields = IdeaCustomFieldsService.new(custom_form).all_fields
        serialized = ::WebApi::V1::CustomFieldSerializer.new(
          fields,
          params: { constraints: pmethod.constraints, supports_answer_visible_to: pmethod.supports_answer_visible_to? },
          include: %i[options options.image matrix_statements]
        ).serializable_hash

        ok(
          "Replaced form on #{params[:container_type]} #{container.id}: #{fields.size} field(s)",
          structured: {
            container_type: params[:container_type],
            container_id: container.id,
            participation_method: pmethod.class.method_str,
            fields_last_updated_at: custom_form.fields_last_updated_at,
            print_start_multiloc: custom_form.print_start_multiloc,
            print_end_multiloc: custom_form.print_end_multiloc,
            print_personal_data_fields: custom_form.print_personal_data_fields,
            fields: serialized
          }
        )
      else
        error("Validation failed: #{result.errors.to_json}")
      end
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

    def assign_print_metadata(form)
      form.print_start_multiloc = params[:print_start_multiloc] if params.key?(:print_start_multiloc)
      form.print_end_multiloc = params[:print_end_multiloc] if params.key?(:print_end_multiloc)
      form.print_personal_data_fields = params[:print_personal_data_fields] if params.key?(:print_personal_data_fields)
    end

    # UpdateAllService reads field params with a mix of string and symbol keys (e.g. it uses
    # field_params['code'] but field_params[:id]). Normalize to a HashWithIndifferentAccess.
    def deep_stringify_field_keys(fields)
      Array(fields).map { |f| f.with_indifferent_access }
    end

    def unsupported_error(pmethod)
      error(
        "Unsupported participation method: '#{pmethod.class.method_str}'. " \
        "replace_form only supports: #{SUPPORTED_METHODS.join(', ')}."
      )
    end
  end

  private

  # JSON Schema for a single field. Mirrors the strong_params shape from
  # IdeaCustomFields::WebApi::V1::IdeaCustomFieldsController#update_all_params. Kept loose
  # on purpose — UpdateAllService + CustomFieldsValidationService enforce the real rules
  # (allowed input types per participation method, locked attributes, page/section structure).
  def field_schema
    {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'UUID of an existing field to update. Omit for new fields.' },
        temp_id: { type: 'string', description: 'Client-side temp ID for a new field. Reference it from another field\'s logic.' },
        code: { type: %w[string null], description: 'Reserved code for built-in fields (e.g. title_multiloc on ideation). Do not invent codes.' },
        key: { type: 'string', description: 'Stable slug. Auto-generated from title if omitted on new fields.' },
        input_type: { type: 'string', description: 'e.g. page, text, multiline_text, select, multiselect, linear_scale, rating, ranking, matrix_linear_scale, file_upload, point, line, polygon. The set of allowed types depends on the participation method.' },
        required: { type: 'boolean' },
        enabled: { type: 'boolean' },
        title_multiloc: multiloc_schema_loose,
        description_multiloc: multiloc_schema_loose,
        page_layout: { type: 'string', description: "Only for input_type='page'. e.g. 'default', 'map'." },
        page_button_label_multiloc: multiloc_schema_loose,
        page_button_link: { type: 'string' },
        dropdown_layout: { type: 'boolean', description: 'For select fields: render as a dropdown.' },
        maximum: { type: 'integer', description: 'Max value for linear_scale / rating (1..11).' },
        min_characters: { type: 'integer' },
        max_characters: { type: 'integer' },
        select_count_enabled: { type: 'boolean' },
        minimum_select_count: { type: 'integer' },
        maximum_select_count: { type: 'integer' },
        random_option_ordering: { type: 'boolean' },
        ask_follow_up: { type: 'boolean' },
        question_category: { type: 'string' },
        include_in_printed_form: { type: 'boolean' },
        map_config_id: { type: 'string' },
        linear_scale_label_1_multiloc: multiloc_schema_loose,
        linear_scale_label_2_multiloc: multiloc_schema_loose,
        linear_scale_label_3_multiloc: multiloc_schema_loose,
        linear_scale_label_4_multiloc: multiloc_schema_loose,
        linear_scale_label_5_multiloc: multiloc_schema_loose,
        linear_scale_label_6_multiloc: multiloc_schema_loose,
        linear_scale_label_7_multiloc: multiloc_schema_loose,
        linear_scale_label_8_multiloc: multiloc_schema_loose,
        linear_scale_label_9_multiloc: multiloc_schema_loose,
        linear_scale_label_10_multiloc: multiloc_schema_loose,
        linear_scale_label_11_multiloc: multiloc_schema_loose,
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              temp_id: { type: 'string' },
              key: { type: 'string' },
              image_id: { type: 'string' },
              other: { type: 'boolean', description: '"Other, please specify" option.' },
              title_multiloc: multiloc_schema_loose
            }
          }
        },
        matrix_statements: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              temp_id: { type: 'string' },
              key: { type: 'string' },
              title_multiloc: multiloc_schema_loose
            }
          }
        },
        logic: {
          type: 'object',
          description: <<~DESC.squish
            Conditional jump rules. Native_survey only. Shape:
            { "rules": [{ "if": "<option_id|temp_id|'any_other_answer'|'no_answer'>",
            "goto_page_id": "<page_id|temp_id>" }] } on selection fields, or
            { "next_page_id": "<page_id|temp_id>" } on pages. Temp IDs are remapped to real IDs after save.
          DESC
        }
      }
    }
  end

  # Looser multiloc schema for nested field payloads — avoids tying every nested multiloc
  # to the tenant locale enum, which would reject legitimate locale codes when the call
  # happens mid-locale-config-change.
  def multiloc_schema_loose
    {
      type: 'object',
      description: 'Localized text: { "<locale>": "<string>" }.',
      additionalProperties: { type: 'string' }
    }
  end
end
