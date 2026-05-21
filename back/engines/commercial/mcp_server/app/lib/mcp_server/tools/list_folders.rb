# frozen_string_literal: true

class McpServer::Tools::ListFolders < McpServer::BaseTool
  description 'Lists project folders'
  input_schema(
    properties: {
      **PAGINATION_SCHEMA
    }
  )

  def self.call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = ProjectFolders::Folder.order(created_at: :desc)

    result = paginate(scope, page: page, per_page: per_page)
    paginated_response('folders', result[:records], result[:pagination],
                       only: %i[id title_multiloc slug])
  end
end
