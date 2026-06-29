# frozen_string_literal: true

class McpServer::Tools::ListProjectFiles < McpServer::BaseTool
  def name = 'list_project_files'

  def description
    <<~DESC.squish
      Lists the project's files. The project's files are a per-project pool of uploaded
      files that can be attached to its resources (e.g., the project itself or phases) via
      `attach_file`. The same file can be attached to multiple resources in the scope of
      the project.
    DESC
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string' },
        **PAGINATION_SCHEMA
      },
      required: %w[project_id],
      additionalProperties: false
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
