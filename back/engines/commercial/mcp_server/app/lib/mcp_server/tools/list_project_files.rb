# frozen_string_literal: true

class McpServer::Tools::ListProjectFiles < McpServer::BaseTool
  def name = 'list_project_files'
  def description = "Lists the project's files."

  def input_schema
    {
      properties: {
        project_id: { type: 'string' },
        **PAGINATION_SCHEMA
      },
      required: %w[project_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.find(params[:project_id])
      scope = project.files.order(created_at: :desc)

      paginated_response(
        'files',
        scope,
        serializer: McpServer::Serializers::File,
        **params.slice(:page, :per_page)
      )
    rescue ActiveRecord::RecordNotFound
      error("Project not found: #{params[:project_id]}")
    end
  end
end
