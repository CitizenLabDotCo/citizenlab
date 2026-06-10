# frozen_string_literal: true

class McpServer::Tools::GetForm < McpServer::BaseTool
  CONTAINER_TYPES = {
    'phase' => Phase,
    'project' => Project
  }.freeze

  SUPPORTED_METHODS = %w[native_survey ideation].freeze

  def name = 'get_form'

  def description
    <<~DESC.squish
      Returns the full form (questions, options, matrix statements, logic, print metadata)
      attached to a native_survey phase or an ideation project. For ideation, pass the
      project_id; for native_survey, pass the phase_id. The response shape mirrors what
      replace_form accepts, so you can round-trip: fetch, edit, replace.
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
      container = CONTAINER_TYPES.fetch(params[:container_type]).find(params[:container_id])
      pmethod = container.pmethod
      return unsupported_error(pmethod) unless SUPPORTED_METHODS.include?(pmethod.class.method_str)

      custom_form = CustomForm.find_or_initialize_by(participation_context: container)
      fields = IdeaCustomFieldsService.new(custom_form).all_fields

      serialized = ::WebApi::V1::CustomFieldSerializer.new(
        fields,
        params: { constraints: pmethod.constraints, supports_answer_visible_to: pmethod.supports_answer_visible_to? },
        include: %i[options options.image matrix_statements]
      ).serializable_hash

      ok(
        "Form for #{params[:container_type]} #{container.id} (#{pmethod.class.method_str}): #{fields.size} field(s)",
        structured: {
          container_type: params[:container_type],
          container_id: container.id,
          participation_method: pmethod.class.method_str,
          fields_last_updated_at: custom_form.fields_last_updated_at,
          print_start_multiloc: custom_form.print_start_multiloc,
          print_end_multiloc: custom_form.print_end_multiloc,
          print_personal_data_fields: custom_form.print_personal_data_fields,
          constraints: pmethod.constraints,
          fields: serialized
        }
      )
    rescue ActiveRecord::RecordNotFound
      error("#{params[:container_type]} not found: #{params[:container_id]}")
    end

    private

    CONTAINER_TYPES = McpServer::Tools::GetForm::CONTAINER_TYPES
    SUPPORTED_METHODS = McpServer::Tools::GetForm::SUPPORTED_METHODS

    def unsupported_error(pmethod)
      error(
        "Unsupported participation method: '#{pmethod.class.method_str}'. " \
        "get_form only supports: #{SUPPORTED_METHODS.join(', ')}."
      )
    end
  end
end
