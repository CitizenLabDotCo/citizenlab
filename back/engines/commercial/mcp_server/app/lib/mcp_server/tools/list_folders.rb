# frozen_string_literal: true

class McpServer::Tools::ListFolders < McpServer::BaseTool
  def name = 'list_folders'
  def description = 'Lists project folders. Search by title.'

  def input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search folders by title' },
        **PAGINATION_SCHEMA
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      finder_params = params.slice(:search)

      scope = FoldersFinderAdminService.execute(
        ProjectFolders::Folder.all,
        finder_params,
      )

      paginated_response(
        'folders',
        scope,
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc slug]
      )
    end
  end
end
