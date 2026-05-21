# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  description 'Lists events for a project, ordered by start date'
  input_schema(
    properties: {
      project_id: { type: 'string', description: 'The ID of the project' },
      **PAGINATION_SCHEMA
    },
    required: %w[project_id]
  )

  def self.call(project_id:, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = EventsFinder.new(
      { project_ids: [project_id] },
      current_user: server_context[:current_user]
    ).find_records.order(:start_at)

    paginated_response(
      'events', scope, page:, per_page:,
      only: %i[id title_multiloc start_at end_at location_multiloc]
    )
  end
end
