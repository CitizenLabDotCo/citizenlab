# frozen_string_literal: true

# Dedicated update tool for phases. Reuses create_phase's (large, conditional) field schema so the
# two stay in sync. Changing participation_method is allowed but the model rejects it when the phase
# already has inputs; method-conditional fields are validated by the model on save.
class McpServer::Tools::UpdatePhase < McpServer::BaseTool
  def name = 'update_phase'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Updates an existing phase. Partial update — only the fields you pass change, and `*_multiloc`
      fields merge per locale. Accepts the same fields as create_phase, except project_id — a phase
      can't be moved to another project. Changing participation_method is rejected if the phase
      already has inputs.
    DESC
  end

  def input_schema
    create_properties = McpServer::Tools::CreatePhase.new.input_schema[:properties].except(:project_id)
    {
      properties: { phase_id: { type: 'string', description: 'The ID of the phase to update.' }, **create_properties },
      additionalProperties: false,
      required: %w[phase_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase

      authorize_project!(phase.project)
      authorize(phase, :update?)

      attributes = params.except(:phase_id)

      # manual_voters_amount goes through a dedicated setter that records who/when, before other assigns.
      manual_voters = attributes.delete(:manual_voters_amount)
      phase.set_manual_voters(manual_voters, current_user) unless manual_voters.nil?
      phase.assign_attributes(merge_multilocs(phase, attributes))

      SideFxPhaseService.new.before_update(phase, current_user)
      phase.save!
      SideFxPhaseService.new.after_update(phase, current_user)

      response(
        "Updated phase #{phase.id}",
        structured: McpServer::Serializers::Phase.serialize(phase, params: { current_user: })
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end
  end
end
