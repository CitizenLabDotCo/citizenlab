# frozen_string_literal: true

class McpServer::Tools::ListEvents < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists events for a project, ordered by start date'

    MCP::Tool.define(name: 'list_events', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project' },
        **PAGINATION_SCHEMA
      },
      required: %w[project_id]
    }
  end

  def call(project_id:, page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
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
