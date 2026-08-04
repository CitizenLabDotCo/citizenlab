# frozen_string_literal: true

module McpServer::BaseTool::ResponseHelpers
  # MCP spec recommends duplicating structured_content into a text block for
  # clients that don't surface structuredContent to the LLM (e.g. Claude Desktop).
  def response(text, structured: nil, **)
    body = structured ? "#{text}\n\n#{structured.to_json}" : text

    MCP::Tool::Response.new(
      [{ type: 'text', text: body }],
      structured_content: structured,
      **
    )
  end

  def error(text, structured: nil, **)
    response(text, structured:, error: true, **)
  end

  def invalid_record_error(record)
    errors = record.errors.map do |e|
      e.details.merge(attribute: e.attribute.to_s, message: e.message)
    end

    error('Validation failed:', structured: { errors: errors })
  end

  def not_found_error(label, id) = error("#{label} not found: #{id}")
end
