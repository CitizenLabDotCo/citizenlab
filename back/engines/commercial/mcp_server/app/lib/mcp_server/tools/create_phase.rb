# frozen_string_literal: true

class McpServer::Tools::CreatePhase < McpServer::BaseTool
  UNGATED_METHODS = %w[
    ideation
    proposals
    information
    native_survey
    voting
    volunteering
  ].freeze

  # Mirrors the admin picker (ParticipationMethodPicker.tsx).
  # `community_monitor_survey` is bootstrapped elsewhere, not picked.
  GATED_METHODS = {
    'common_ground' => 'common_ground',
    'document_annotation' => 'konveio_document_annotation',
    'poll' => 'polls',
    'survey' => 'surveys'
  }.freeze

  def name = 'create_phase'
  def description = 'Creates a new phase for a project'

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project' },
        title_multiloc: { **multiloc_schema, description: 'Phase title.' },
        start_at: { type: 'string', description: 'Phase start date in ISO 8601 format' },
        end_at: { type: 'string', description: 'Phase end date in ISO 8601 format. Optional for the last phase.' },
        participation_method: {
          type: 'string',
          enum: available_participation_methods,
          description: 'Participation method. Defaults to "ideation".'
        },
        description_multiloc: { **multiloc_schema, description: 'Phase description (HTML).' }
      },
      required: %w[project_id title_multiloc start_at]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.new(**params)

      SideFxPhaseService.new.before_create(phase, current_user)
      phase.save!
      SideFxPhaseService.new.after_create(phase, current_user)

      ok(
        "Created phase #{phase.id}",
        structured: phase.as_json(only: %i[id project_id title_multiloc start_at end_at participation_method])
      )
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end

  private

  def available_participation_methods
    config = AppConfiguration.instance
    enabled_gated = GATED_METHODS.select { |_, flag| config.feature_activated?(flag) }.keys
    (UNGATED_METHODS + enabled_gated) & Phase::PARTICIPATION_METHODS
  end
end
