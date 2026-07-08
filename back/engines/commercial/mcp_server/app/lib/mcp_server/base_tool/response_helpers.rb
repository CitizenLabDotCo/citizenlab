# frozen_string_literal: true

module McpServer::BaseTool::ResponseHelpers
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

  def validation_error(record)
    error("Validation failed: #{record.errors.full_messages.join(', ')}")
  end
end
