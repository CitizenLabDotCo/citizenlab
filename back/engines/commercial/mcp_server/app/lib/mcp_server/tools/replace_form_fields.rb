# frozen_string_literal: true

class McpServer::Tools::ReplaceFormFields < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'replace_form_fields'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC
      Replaces the field list of the form attached to a native_survey phase or ideation
      project. The fields array is the complete new form — any existing field whose id is
      not in the array is deleted. New fields are created (use temp_id to reference them
      from logic rules).

      Fails if any responses (ideas) exist on the container. 

      Call `get_form_fields` first to see the current shape and the participation method's
      constraints.
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
        fields_last_updated_at: {
          type: 'string',
          description: 'Optional stale-data guard. If set, the call fails when the form was modified server-side after this timestamp.'
        }
      },
      required: %w[container_type container_id fields]
    }
  end

  private

  def field_schema
    McpServer::Tools::FormFieldsSchemaBuilder.new(
      mode: :input,
      tenant_locales: AppConfiguration.instance.settings.dig('core', 'locales')
    ).field_schema
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      container = CONTAINER_TYPES
        .fetch(params[:container_type])
        .find_by(id: params[:container_id])

      unless container
        return not_found_error("Container (#{params[:container_type]})", params[:container_id])
      end

      authorize_project!(container.project)
      authorize(container, :update?)

      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      if container.ideas_count.to_i.positive?
        return error(<<~MSG.squish)
          Cannot replace form fields: #{container.ideas_count} response(s) already
          submitted to this #{params[:container_type]}. Replacing the fields would
          orphan their answers.
        MSG
      end

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      custom_form.save! if custom_form.new_record?

      result = IdeaCustomFields::UpdateAllService.new(
        custom_form,
        current_user,
        custom_fields: normalize_fields(params[:fields]),
        fields_last_updated_at: params[:fields_last_updated_at],
        form_save_type: 'manual',
        form_opened_at: nil
      ).update_all

      if result.success?
        custom_form.reload
        fields = IdeaCustomFieldsService.new(custom_form).all_fields

        response(
          "Replaced fields on #{params[:container_type]} #{container.id}: #{fields.size} field(s)",
          structured: {
            container_type: params[:container_type],
            container_id: container.id,
            participation_method: pmethod.class.method_str,
            fields_last_updated_at: custom_form.fields_last_updated_at,
            constraints: pmethod.constraints,
            fields: McpServer::Serializers::CustomField.serialize(fields, params: { constraints: nil })
          }
        )
      else
        validation_error(result.errors)
      end
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    # Actionable prose for the form-level error keys of IdeaCustomFields::UpdateAllService.
    FORM_ERROR_MESSAGES = {
      'empty' => 'The `fields` array must not be empty.',
      'no_first_page' => 'The first field must be a page.',
      'no_end_page' => "The last field must be the form-end page (`input_type: 'page'`, `key: 'form_end'`).",
      'locked_deletion' => <<~MSG.squish,
        A locked built-in field is missing. Locked fields must be echoed back —
        see the constraints returned by `get_form_fields`.
      MSG
      'locked_attribute' => <<~MSG.squish,
        A locked attribute of a built-in field was changed. Locked attributes must be
        echoed back unchanged — see the constraints returned by `get_form_fields`.
      MSG
      'stale_data' => <<~MSG.squish
        The form fields were modified after the given `fields_last_updated_at`.
        Call `get_form_fields` again and re-apply your changes.
      MSG
    }.freeze

    def validation_error(errors)
      # Fall back to the raw error key, so unmapped validation errors still surface.
      messages = Array(errors[:form]).map do |form_error|
        key = form_error[:error]
        FORM_ERROR_MESSAGES[key] || key
      end

      details = messages.any? ? messages.join(' ') : errors.to_json
      error("Validation failed: #{details}", structured: { errors: errors })
    end

    # UpdateAllService reads field params with a mix of string and symbol keys (e.g. it uses
    # field_params['code'] but field_params[:id]). Normalize to a HashWithIndifferentAccess.
    def normalize_fields(fields)
      Array(fields).map(&:with_indifferent_access)
    end

    def unsupported_error(pmethod)
      error(<<~MSG.squish)
        Unsupported participation method: '#{pmethod.class.method_str}'.
        `replace_form_fields` only supports: #{SUPPORTED_METHODS.join(', ')}.
      MSG
    end
  end
end
