# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  def name = 'list_events'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists events for a project, ordered by start date'

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

      scope = EventsFinder
        .new({ project_ids: project.id }, current_user:)
        .find_records
        .order(:start_at)

      paginated_response(
        'events',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::Event,
        params: { current_user: }
      )
    end
  end
end
