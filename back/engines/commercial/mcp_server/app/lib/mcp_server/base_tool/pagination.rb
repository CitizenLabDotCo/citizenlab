# frozen_string_literal: true

module McpServer::BaseTool::Pagination
  include McpServer::BaseTool::ResponseHelpers

  MAX_PER_PAGE = 50
  DEFAULT_PER_PAGE = 20

  PAGINATION_SCHEMA = {
    page: { type: 'integer', description: 'Page number (default: 1)' },
    per_page: { type: 'integer', description: "Results per page (default: #{DEFAULT_PER_PAGE}, max: #{MAX_PER_PAGE})" }
  }.freeze

  def paginated_response(label, scope, page: nil, per_page: nil, **json_options)
    page ||= 1
    per_page = (per_page || DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)

    records = scope.page(page).per(per_page)

    pagination = {
      page: records.current_page,
      per_page: per_page,
      total_count: records.total_count,
      total_pages: records.total_pages
    }

    structured_content = {
      data: records.as_json(**json_options),
      pagination: pagination
    }

    summary = <<~TEXT.squish
      Found #{pagination[:total_count]} #{label}
      (showing page #{pagination[:page]}, #{pagination[:per_page]} per page)
    TEXT

    ok(summary, structured: structured_content)
  end
end
