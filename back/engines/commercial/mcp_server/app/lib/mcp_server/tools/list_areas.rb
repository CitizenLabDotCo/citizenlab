# frozen_string_literal: true

class McpServer::Tools::ListAreas < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists geographic/administrative areas'

    MCP::Tool.define(name: 'list_areas', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    { properties: { **PAGINATION_SCHEMA } }
  end

  def call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = Area.order(:ordering)

    paginated_response(
      'areas', scope, page:, per_page:,
      only: %i[id title_multiloc ordering]
    )
  end
end
