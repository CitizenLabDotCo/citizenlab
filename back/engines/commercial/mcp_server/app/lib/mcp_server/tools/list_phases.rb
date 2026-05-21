# frozen_string_literal: true

class McpServer::Tools::ListPhases < McpServer::BaseTool
  description 'Lists phases for a project, ordered by start date'
  input_schema(
    properties: {
      project_id: { type: 'string', description: 'The ID of the project' }
    },
    required: %w[project_id]
  )

  def self.call(project_id:, server_context:)
    project = Project.find(project_id)
    phases = project.phases.order(:start_at)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{phases.size} phases" }],
      structured_content: { phases: phases.as_json(only: %i[id title_multiloc start_at end_at participation_method]) }
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
