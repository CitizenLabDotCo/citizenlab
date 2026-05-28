# frozen_string_literal: true

class McpServer::Tools::ListUserCustomFields < McpServer::BaseTool
  description <<~DESC.squish
    Lists user profile fields (aka demographic questions or user custom fields).
  DESC

  input_schema(
    properties: { **PAGINATION_SCHEMA }
  )

  def self.call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = CustomField.registration.enabled.not_hidden.order(:ordering)

    paginated_response(
      'user custom fields', scope, page:, per_page:,
      only: %i[id title_multiloc input_type code required]
    )
  end
end
