# frozen_string_literal: true

class McpServer::Tools::ListProjects < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists projects. Search by title or description.'

    MCP::Tool.define(name: 'list_projects', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search by title or description' },
        **PAGINATION_SCHEMA
      }
    }
  end

  def call(search: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = ProjectsFinderAdminService.execute(
      Project.all,
      { search: search }.compact,
      current_user: server_context[:current_user]
    )

    paginated_response(
      'projects', scope, page:, per_page:,
      only: %i[id title_multiloc slug created_at]
    )
  end
end
