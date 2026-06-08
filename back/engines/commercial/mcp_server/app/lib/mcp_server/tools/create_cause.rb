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
        description_multiloc: { **multiloc_schema, description: 'Cause description (HTML).' }
      },
      required: %w[phase_id title_multiloc]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find(params[:phase_id])

      attributes = params.slice(:title_multiloc, :description_multiloc).compact
      cause = Volunteering::Cause.new(phase: phase, **attributes)

      Volunteering::SideFxCauseService.new.before_create(cause, current_user)
      cause.save!
      Volunteering::SideFxCauseService.new.after_create(cause, current_user)

      ok(
        "Created cause #{cause.id}",
        structured: cause.as_json(only: %i[id phase_id title_multiloc description_multiloc ordering volunteers_count])
      )
    rescue ActiveRecord::RecordNotFound
      error("Phase not found: #{params[:phase_id]}")
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end
end
