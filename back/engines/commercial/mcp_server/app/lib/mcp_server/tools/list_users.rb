# frozen_string_literal: true

class McpServer::Tools::ListUsers < McpServer::BaseTool
  description 'Lists users. Search by name/email, filter by role.'
  input_schema(
    properties: {
      search: { type: 'string', description: 'Search by name or email' },
      role: { type: 'string', enum: %w[admin moderator], description: 'Filter by role' },
      **PAGINATION_SCHEMA
    }
  )

  def self.call(search: nil, role: nil, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = User.active.order(created_at: :desc)
    scope = scope.admin if role == 'admin'
    scope = scope.moderator if role == 'moderator'
    scope = scope.search_by_all(search) if search.present?

    result = paginate(scope, page: page, per_page: per_page)

    paginated_response(
      'users',
      result[:records],
      result[:pagination],
      only: %i[id first_name last_name email roles]
    )
  end
end
