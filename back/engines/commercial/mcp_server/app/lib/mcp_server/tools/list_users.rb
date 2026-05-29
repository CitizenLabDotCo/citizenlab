# frozen_string_literal: true

class McpServer::Tools::ListUsers < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists users. Search by name/email, filter by role.'

    MCP::Tool.define(name: 'list_users', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search by name or email' },
        role: { type: 'string', enum: %w[admin moderator], description: 'Filter by role' },
        **PAGINATION_SCHEMA
      }
    }
  end

  def call(search: nil, role: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = User.active.order(created_at: :desc)
    scope = scope.admin if role == 'admin'
    scope = scope.moderator if role == 'moderator'
    scope = scope.search_by_all(search) if search.present?

    paginated_response(
      'users', scope, page:, per_page:,
      only: %i[id first_name last_name email roles]
    )
  end
end
