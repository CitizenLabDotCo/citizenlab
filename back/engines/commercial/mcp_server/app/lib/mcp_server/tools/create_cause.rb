# frozen_string_literal: true

class McpServer::Tools::CreateCause < McpServer::BaseTool
  def name = 'create_volunteering_cause'

  def description
    <<~DESC.squish
      Creates a volunteering cause (a sign-up opportunity citizens can volunteer for)
      within a volunteering phase. Volunteering phases start empty — add one cause per
      opportunity. The phase's participation_method must be 'volunteering'.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string', description: 'The ID of the volunteering phase to add the cause to.' },
        title_multiloc: { **multiloc_schema, description: 'Cause title.' },
        description_multiloc: { **multiloc_schema, description: 'Cause description (HTML).' },
        remote_image_url: {
          type: 'string',
          format: 'uri',
          description: 'Public URL of the image to download and use as the cause illustration.'
        }
      },
      required: %w[phase_id title_multiloc],
      additionalProperties: false
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find(params[:phase_id])
      authorize_project!(phase.project)

      attributes = params.except(:phase_id)
      cause = Volunteering::Cause.new(phase: phase, **attributes)
      authorize(cause, :create?)

      Volunteering::SideFxCauseService.new.before_create(cause, current_user)
      cause.save!
      Volunteering::SideFxCauseService.new.after_create(cause, current_user)

      ok(
        "Created cause #{cause.id}",
        structured: McpServer::Serializers::Cause.serialize(cause, params: { current_user: current_user })
      )
    rescue ActiveRecord::RecordNotFound
      error("Phase not found: #{params[:phase_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
