# frozen_string_literal: true

class McpServer::Tools::ListUsers < McpServer::BaseTool
  def name = 'list_users'
  def description = 'Lists users. Search by name/email, filter by role.'

  def input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search by name or email' },
        role: { type: 'string', enum: %w[admin moderator], description: 'Filter by role' },
        **PAGINATION_SCHEMA
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      scope = User.active.order(created_at: :desc)
      scope = scope.admin if params[:role] == 'admin'
      scope = scope.moderator if params[:role] == 'moderator'
      scope = scope.search_by_all(params[:search]) if params[:search].present?

      paginated_response(
        'users',
        scope,
        **params.slice(:page, :per_page),
        only: %i[id first_name last_name email roles]
      )
    end
  end
end
