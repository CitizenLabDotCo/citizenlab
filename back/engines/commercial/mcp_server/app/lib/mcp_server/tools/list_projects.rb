# frozen_string_literal: true

class McpServer::Tools::ListProjects < McpServer::BaseTool
  description 'Lists projects. Search by title or description.'
  input_schema(
    properties: {
      search: { type: 'string', description: 'Search by title or description' },
      **PAGINATION_SCHEMA
    }
  )

  def self.call(search: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = ProjectsFinderAdminService.execute(
      Project.all,
      { search: search }.compact,
      current_user: server_context[:current_user]
    )

    result = paginate(scope, page: page, per_page: per_page)

    paginated_response(
      'projects',
      result[:records],
      result[:pagination],
      only: %i[id title_multiloc slug created_at]
    )
  end
end
