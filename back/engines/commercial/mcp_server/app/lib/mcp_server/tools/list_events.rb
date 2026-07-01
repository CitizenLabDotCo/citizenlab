# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  def name = 'list_events'
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
      scope = EventsFinder
        .new({ project_ids: params[:project_id] }, current_user:)
        .find_records
        .order(:start_at)

      paginated_response(
        'events',
        scope,
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc start_at end_at location_multiloc]
      )
    end
  end
end
