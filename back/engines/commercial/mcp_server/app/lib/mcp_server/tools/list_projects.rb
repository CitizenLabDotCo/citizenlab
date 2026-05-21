# frozen_string_literal: true

class McpServer::Tools::ListProjects < McpServer::BaseTool
  description 'Lists projects. Optionally filter by title search.'
  input_schema(
    properties: {
      search: { type: 'string', description: 'Search term to filter projects by title' }
    }
  )

  def self.call(search: nil, server_context:)
    projects = Project.order(created_at: :desc).limit(25)
    projects = projects.search_by_all(search) if search.present? && Project.respond_to?(:search_by_all)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{projects.size} projects" }],
      structured_content: { projects: projects.as_json(only: %i[id title_multiloc slug created_at]) }
    )
  end
end
