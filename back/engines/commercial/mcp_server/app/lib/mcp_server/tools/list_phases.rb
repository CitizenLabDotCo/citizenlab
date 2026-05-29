# frozen_string_literal: true

class McpServer::Tools::ListPhases < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists phases for a project, ordered by start date'

    MCP::Tool.define(name: 'list_phases', description:, input_schema:) do |**kwargs|
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
    project = Project.find(project_id)
    scope = project.phases.order(:start_at)

    paginated_response(
      'phases', scope, page:, per_page:,
      only: %i[id title_multiloc start_at end_at participation_method]
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Project not found: #{project_id}" }],
      error: true
    )
  end
end
