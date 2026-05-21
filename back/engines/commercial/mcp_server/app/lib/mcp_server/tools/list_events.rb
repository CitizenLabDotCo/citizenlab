# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  description 'Lists events for a project, ordered by start date'
  input_schema(
    properties: {
      project_id: { type: 'string', description: 'The ID of the project' },
      **PAGINATION_SCHEMA
    },
    required: %w[project_id]
  )

  def self.call(project_id:, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    project = Project.find(project_id)
    scope = project.events.order(:start_at)

    result = paginate(scope, page: page, per_page: per_page)
    paginated_response('events', result[:records], result[:pagination],
                       only: %i[id title_multiloc start_at end_at location_multiloc])
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
