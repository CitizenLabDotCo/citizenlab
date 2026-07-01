# frozen_string_literal: true

class McpServer::Tools::ListProjects < McpServer::BaseTool
  def name = 'list_projects'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists projects. Search by title or description.'

  def input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search by title or description' },
        **PAGINATION_SCHEMA
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      scope = ProjectsFinderAdminService.execute(
        Project.all,
        params.slice(:search),
        current_user: current_user
      )

      paginated_response(
        'projects',
        scope,
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc slug created_at]
      )
    end
  end
end
