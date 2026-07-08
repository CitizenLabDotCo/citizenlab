# frozen_string_literal: true

class McpServer::Tools::ListPhases < McpServer::BaseTool
  def name = 'list_phases'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists phases for a project, ordered by start date'

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project' },
        **PAGINATION_SCHEMA
      },
      required: %w[project_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      project = Project.find(params[:project_id])
      scope = project.phases.order(:start_at)

      paginated_response(
        'phases',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::PhaseSummary
      )
    rescue ActiveRecord::RecordNotFound
      error("Project not found: #{params[:project_id]}")
    end
  end
end
