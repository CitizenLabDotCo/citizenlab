# frozen_string_literal: true

class McpServer::BaseTool < MCP::Tool
  MAX_PER_PAGE = 50
  DEFAULT_PER_PAGE = 20

  PAGINATION_SCHEMA = {
    page: { type: 'integer', description: 'Page number (default: 1)' },
    per_page: { type: 'integer', description: "Results per page (default: #{DEFAULT_PER_PAGE}, max: #{MAX_PER_PAGE})" }
  }.freeze

  def self.to_multiloc(value)
    return value if value.is_a?(Hash)

    locale = AppConfiguration.instance.settings.dig('core', 'locales')&.first || 'en'
    { locale => value }
  end

  def self.paginate(scope, page: 1, per_page: DEFAULT_PER_PAGE)
    page = [page.to_i, 1].max
    per_page = [[per_page.to_i, 1].max, MAX_PER_PAGE].min
    total_count = scope.count
    records = scope.offset((page - 1) * per_page).limit(per_page)

    {
      records: records,
      pagination: {
        page: page,
        per_page: per_page,
        total_count: total_count,
        total_pages: (total_count.to_f / per_page).ceil
      }
    }
  end

  def self.paginated_response(label, records, pagination, json_options = {})
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{pagination[:total_count]} #{label} (showing page #{pagination[:page]}, #{pagination[:per_page]} per page)" }],
      structured_content: {
        data: records.as_json(**json_options),
        pagination: pagination
      }
    )
  end
end
