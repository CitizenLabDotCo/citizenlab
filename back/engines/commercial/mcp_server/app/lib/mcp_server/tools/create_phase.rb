# frozen_string_literal: true

class McpServer::Tools::CreatePhase < McpServer::BaseTool
  description 'Creates a new phase for a project'
  input_schema(
    properties: {
      project_id: { type: 'string', description: 'The ID of the project' },
      title: { description: 'Phase title. A plain string (uses default locale) or a hash of locale => string.' },
      start_at: { type: 'string', description: 'Phase start date in ISO 8601 format' },
      end_at: { type: 'string', description: 'Phase end date in ISO 8601 format. Optional for the last phase.' },
      participation_method: {
        type: 'string',
        enum: %w[ideation proposals information native_survey voting poll volunteering],
        description: 'Participation method. Defaults to "ideation".'
      },
      description: { description: 'Phase description (HTML). A plain string or a hash of locale => string.' }
    },
    required: %w[project_id title start_at]
  )

  def self.call(project_id:, title:, start_at:, end_at: nil, participation_method: 'ideation', description: nil, server_context:)
    project = Project.find(project_id)

    phase = Phase.new(
      project: project,
      title_multiloc: to_multiloc(title),
      description_multiloc: description ? to_multiloc(description) : {},
      start_at: start_at,
      end_at: end_at,
      participation_method: participation_method
    )

    user = server_context[:current_user]
    SideFxPhaseService.new.before_create(phase, user)

    if phase.save
      SideFxPhaseService.new.after_create(phase, user)
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Created phase #{phase.id}" }],
        structured_content: phase.as_json(only: %i[id project_id title_multiloc start_at end_at participation_method])
      )
    else
      MCP::Tool::Response.new(
        [{ type: 'text', text: "Validation failed: #{phase.errors.full_messages.join(', ')}" }],
        error: true
      )
    end
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
