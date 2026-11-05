# frozen_string_literal: true

module McpServer
  module SpecSupport
    # Invokes an MCP tool the same way the controller does — through +BaseTool.for+.
    #
    # @example
    #   response = run_mcp_tool(
    #     McpServer::Tools::CreatePhase,
    #     params: { project_id: project.id, ... },
    #     current_user: user
    #   )
    #
    #   expect(response.error).to be_falsy
    def run_mcp_tool(tool_class, params:, current_user:, token_scopes: [])
      mcp_tool = tool_class.for(current_user: current_user, token_scopes: token_scopes)
      mcp_tool.call(server_context: {}, **params)
    end
  end
end

RSpec.configure do |config|
  config.include McpServer::SpecSupport
end
