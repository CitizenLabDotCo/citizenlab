# frozen_string_literal: true

class McpServer::Tools::ListFolders < McpServer::BaseTool
  description 'Lists project folders'
  input_schema(
    properties: {}
  )

  def self.call(server_context:)
    folders = ProjectFolders::Folder.order(created_at: :desc)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{folders.size} folders" }],
      structured_content: { folders: folders.as_json(only: %i[id title_multiloc slug]) }
    )
  end
end
