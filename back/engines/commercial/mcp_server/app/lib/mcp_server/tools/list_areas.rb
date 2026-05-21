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

    result = paginate(scope, page: page, per_page: per_page)

    paginated_response(
      'areas',
      result[:records],
      result[:pagination],
      only: %i[id title_multiloc ordering]
    )
  end
end
