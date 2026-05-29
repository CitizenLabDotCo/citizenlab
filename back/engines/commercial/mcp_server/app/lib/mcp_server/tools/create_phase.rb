# frozen_string_literal: true

class McpServer::Tools::CreatePhase < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Creates a new phase for a project'

    MCP::Tool.define(name: 'create_phase', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project' },
        title: { **multiloc_schema, description: 'Phase title.' },
        start_at: { type: 'string', description: 'Phase start date in ISO 8601 format' },
        end_at: { type: 'string', description: 'Phase end date in ISO 8601 format. Optional for the last phase.' },
        participation_method: {
          type: 'string',
          enum: %w[ideation proposals information native_survey voting poll volunteering],
          description: 'Participation method. Defaults to "ideation".'
        },
        description: { **multiloc_schema, description: 'Phase description (HTML).' }
      },
      required: %w[project_id title start_at]
    }
  end

  def call(project_id:, title:, start_at:, end_at: nil, participation_method: 'ideation', description: nil, server_context:)
    project = Project.find(project_id)

    attributes = {
      project: project,
      title_multiloc: title,
      start_at: start_at,
      end_at: end_at,
      participation_method: participation_method
    }
    attributes[:description_multiloc] = description if description

    phase = Phase.new(attributes)

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
