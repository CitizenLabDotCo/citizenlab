# frozen_string_literal: true

class McpServer::Tools::GetFormFields < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'get_form_fields'

  def description
    <<~DESC.squish
      Returns the ordered list of fields (questions, pages, options, matrix statements,
      logic) for the form attached to a native_survey phase or an ideation project.
      For ideation, pass the project_id; for native_survey, pass the phase_id. The
      response shape mirrors what replace_form_fields accepts, so you can round-trip:
      fetch, edit, replace.
    DESC
  end

  def input_schema
    {
      properties: {
        container_type: { type: 'string', enum: CONTAINER_TYPES.keys, description: "'phase' for native_survey, 'project' for ideation." },
        container_id: { type: 'string', description: 'ID of the phase or project.' }
      },
      required: %w[container_type container_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    CONTAINER_TYPES = McpServer::Tools::GetFormFields::CONTAINER_TYPES
    SUPPORTED_METHODS = McpServer::Tools::GetFormFields::SUPPORTED_METHODS

    def run
      container = CONTAINER_TYPES.fetch(params[:container_type]).find(params[:container_id])
      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      fields = IdeaCustomFieldsService.new(custom_form).all_fields

      ok(
        "Form fields for #{params[:container_type]} #{container.id} (#{pmethod.class.method_str}): #{fields.size} field(s)",
        structured: {
          container_type: params[:container_type],
          container_id: container.id,
          participation_method: pmethod.class.method_str,
          fields_last_updated_at: custom_form.fields_last_updated_at,
          constraints: pmethod.constraints,
          fields: McpServer::Serializers::CustomField.serialize(fields, params: { constraints: nil })
        }
      )
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    end

    private

    def unsupported_error(pmethod)
      error(
        "Unsupported participation method: '#{pmethod.class.method_str}'. " \
        "get_form_fields only supports: #{SUPPORTED_METHODS.join(', ')}."
      )
    end
  end
end
