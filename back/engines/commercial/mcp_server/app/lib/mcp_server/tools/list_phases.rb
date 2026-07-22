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
      project = Project.find_by(id: params[:project_id])
      return not_found_error('Project', params[:project_id]) unless project

      paginated_response(
        'phases',
        project.phases.order(:start_at),
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::PhaseSummary
      )
    end
  end
end
