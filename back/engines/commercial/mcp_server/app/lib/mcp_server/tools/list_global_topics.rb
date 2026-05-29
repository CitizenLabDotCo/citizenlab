# frozen_string_literal: true

class McpServer::Tools::ListGlobalTopics < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists global topic categories for projects'

    MCP::Tool.define(name: 'list_global_topics', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    { properties: { **PAGINATION_SCHEMA } }
  end

  def call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = GlobalTopic.order(:ordering)

    paginated_response(
      'global topics', scope, page:, per_page:,
      only: %i[id title_multiloc icon]
    )
  end
end
