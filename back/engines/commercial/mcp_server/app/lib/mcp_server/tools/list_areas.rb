# frozen_string_literal: true

class McpServer::Tools::ListAreas < McpServer::BaseTool
  description 'Lists geographic/administrative areas'
  input_schema(
    properties: {}
  )

  def self.call(server_context:)
    areas = Area.order(:ordering)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{areas.size} areas" }],
      structured_content: { areas: areas.as_json(only: %i[id title_multiloc ordering]) }
    )
  end
end
