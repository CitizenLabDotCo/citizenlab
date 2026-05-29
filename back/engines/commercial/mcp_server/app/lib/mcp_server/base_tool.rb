# frozen_string_literal: true

class McpServer::BaseTool < MCP::Tool
  include McpServer::BaseTool::Pagination
  include McpServer::BaseTool::Multiloc
end
