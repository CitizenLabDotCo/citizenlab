# frozen_string_literal: true

class McpServer::Tools::GetFormFields < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'get_form_fields'

  def description
    <<~DESC
      Returns the fields (questions and page breaks) in display order for the form
      attached to a native-survey phase, or for a project's ideation form. The same
      ideation form is shared across all ideation phases of a project, so the container is
      the project (`container_type: 'project'`). Native-survey forms are specific to a
      single phase, so the container is the phase (`container_type: 'phase'`).

      In native-survey forms, fields can carry branching logic. By default, participants
      move through fields in display order, but logic rules can skip ahead to a specific
      page, either based on the answer to a question or at the end of a page.

      The response also includes the participation method's constraints, which mark
      built-in fields that can't be deleted or have certain attributes changed.

      The response shape matches what `replace_form_fields` accepts, so you can round-trip:
      fetch fields → edit → replace.
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
    def run
      container = CONTAINER_TYPES
        .fetch(params[:container_type])
        .find(params[:container_id])

      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      fields = IdeaCustomFieldsService.new(custom_form).all_fields
      participation_method = pmethod.class.method_str

      ok(
        "Found #{fields.size} field(s) for #{participation_method} form",
        structured: {
          container_type: params[:container_type],
          container_id: container.id,
          participation_method:,
          fields_last_updated_at: custom_form.fields_last_updated_at,
          constraints: pmethod.constraints,
          # Dropping the constraints from the fields, as they are already included in the
          # constraints field.
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
