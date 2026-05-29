# frozen_string_literal: true

class McpServer::Tools::ListFolders < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists project folders. Search by title.'

    MCP::Tool.define(name: 'list_folders', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search folders by title' },
        **PAGINATION_SCHEMA
      }
    }
  end

  def call(search: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
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
