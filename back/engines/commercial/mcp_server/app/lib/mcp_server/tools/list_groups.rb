# frozen_string_literal: true

class McpServer::Tools::ListGroups < McpServer::BaseTool
  def name = 'list_groups'
  def description = 'Lists user groups. Search by title or filter by project.'

  def input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search groups by title' },
        project_id: { type: 'string', description: 'Only groups associated with this project' },
        **PAGINATION_SCHEMA
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      scope = Group.all
      scope = scope.search_by_title(params[:search]) if params[:search].present?
      scope = scope.by_project_id(params[:project_id]) if params[:project_id].present?

      paginated_response(
        'groups',
        scope.order_new,
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc membership_type memberships_count]
      )
    end
  end
end
