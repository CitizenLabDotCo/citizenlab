# frozen_string_literal: true

class McpServer::Tools::HelloWorld < MCP::Tool
  description 'A simple hello world tool that greets the user'
  input_schema(
    properties: { name: { type: 'string' } },
    required: ['name']
  )

  def self.call(name:, server_context:)
    MCP::Tool::Response.new([{
      type: 'text',
      text: "Hello, #{name}! (from CitizenLab MCP)"
    }])
  end
end
