# frozen_string_literal: true

class McpServer::Tools::ListUserCustomFields < McpServer::BaseTool
  def self.make
    klass = self
    description = 'Lists user profile fields (aka demographic questions or user custom fields).'

    MCP::Tool.define(name: 'list_user_custom_fields', description:, input_schema:) do |**kwargs|
      klass.new.call(**kwargs)
    end
  end

  def self.input_schema
    { properties: { **PAGINATION_SCHEMA } }
  end

  def call(page: 1, per_page: DEFAULT_PER_PAGE, server_context:)
    scope = CustomField.registration.enabled.not_hidden.order(:ordering)

    paginated_response(
      'user custom fields', scope, page:, per_page:,
      only: %i[id title_multiloc input_type code required]
    )
  end
end
