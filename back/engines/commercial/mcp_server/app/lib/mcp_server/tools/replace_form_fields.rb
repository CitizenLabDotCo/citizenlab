# frozen_string_literal: true

class McpServer::Tools::ReplaceFormFields < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'replace_form_fields'

  def description
    <<~DESC.squish
      Replaces the field list of the form attached to a native_survey phase or ideation
      project. The fields array is the complete new form — any existing field whose id is
      not in the array is deleted. New fields are created (use temp_id to reference them
      from logic rules). Refuses if any responses (ideas) exist on the container. Call
      get_form_fields first to see the current shape and the participation method's
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
      container = CONTAINER_TYPES.fetch(params[:container_type]).find(params[:container_id])
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

        ok(
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
        error("Validation failed: #{result.errors.to_json}")
      end
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end

    private

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
