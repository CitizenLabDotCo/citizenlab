# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  description 'Lists events for a project, ordered by start date'
  input_schema(
    properties: {
      project_id: { type: 'string', description: 'The ID of the project' }
    },
    required: %w[project_id]
  )

  def self.call(project_id:, server_context:)
    project = Project.find(project_id)
    events = project.events.order(:start_at)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{events.size} events" }],
      structured_content: { events: events.as_json(only: %i[id title_multiloc start_at end_at location_multiloc]) }
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
