# frozen_string_literal: true

class McpServer::Tools::ListGlobalTopics < McpServer::BaseTool
  description 'Lists global topic categories for projects'
  input_schema(
    properties: {
      **PAGINATION_SCHEMA
    }
  )

  def self.call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = GlobalTopic.order(:ordering)

    paginated_response(
      'global topics', scope, page:, per_page:,
      only: %i[id title_multiloc icon]
    )
  end
end
