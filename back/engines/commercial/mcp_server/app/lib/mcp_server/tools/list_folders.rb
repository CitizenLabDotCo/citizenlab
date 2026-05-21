# frozen_string_literal: true

class McpServer::Tools::ListFolders < McpServer::BaseTool
  description 'Lists project folders. Search by title.'
  input_schema(
    properties: {
      search: { type: 'string', description: 'Search folders by title' },
      **PAGINATION_SCHEMA
    }
  )

  def self.call(search: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = FoldersFinderAdminService.execute(
      ProjectFolders::Folder.all,
      { search: search }.compact
    )

    paginated_response(
      'folders', scope, page:, per_page:,
      only: %i[id title_multiloc slug]
    )
  end
end
