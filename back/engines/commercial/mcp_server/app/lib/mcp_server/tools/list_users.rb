# frozen_string_literal: true

class McpServer::Tools::ListUsers < McpServer::BaseTool
  description 'Lists users. Optionally filter by role (admin, moderator).'
  input_schema(
    properties: {
      role: { type: 'string', enum: %w[admin moderator], description: 'Filter by role' }
    }
  )

  def self.call(role: nil, server_context:)
    users = User.active.order(:created_at)
    users = users.admin if role == 'admin'
    users = users.moderator if role == 'moderator'
    users = users.limit(50)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{users.size} users" }],
      structured_content: { users: users.as_json(only: %i[id first_name last_name email roles]) }
    )
  end
end
