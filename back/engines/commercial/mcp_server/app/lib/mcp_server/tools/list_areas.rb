# frozen_string_literal: true

class McpServer::Tools::ListAreas < McpServer::BaseTool
  description 'Lists geographic/administrative areas'
  input_schema(
    properties: {
      **PAGINATION_SCHEMA
    }
  )

  def self.call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = Area.order(:ordering)

    paginated_response(
      'areas', scope, page:, per_page:,
      only: %i[id title_multiloc ordering]
    )
  end
end
