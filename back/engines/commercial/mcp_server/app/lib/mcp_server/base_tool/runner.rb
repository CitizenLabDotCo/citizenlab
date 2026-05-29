# frozen_string_literal: true

# Runtime base class for MCP tools. Every Tool class nests a `Runner < BaseTool::Runner`
# whose `#run` method is the actual tool implementation.
class McpServer::BaseTool::Runner
  include McpServer::BaseTool::Pagination

  attr_reader :params, :server_context, :current_user, :token_scopes

  def initialize(params:, server_context:, current_user:, token_scopes: [])
    @params = params
    @server_context = server_context
    @current_user = current_user
    @token_scopes = token_scopes
  end

  def run
    raise NotImplementedError, 'Subclasses must implement #run'
  end

  def ok(text, structured: nil)
    # MCP spec recommends duplicating structured_content into a text block for
    # clients that don't surface structuredContent to the LLM (e.g. Claude Desktop).
    body = structured ? "#{text}\n\n#{structured.to_json}" : text

    MCP::Tool::Response.new(
      [{ type: 'text', text: body }],
      structured_content: structured
    )
  end

  def error(text)
    MCP::Tool::Response.new(
      [{ type: 'text', text: text }],
      error: true
    )
  end
end
