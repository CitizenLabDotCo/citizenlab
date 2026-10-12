# frozen_string_literal: true

class McpServer::Tools::ListCustomPages < McpServer::BaseTool
  def name = 'list_custom_pages'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists the platform's custom pages (user-created global static pages) for the CustomPages
      homepage widget. Returns each page's id, title and slug.
    DESC
  end

  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      # Only global, user-created pages — the widget offers nothing else.
      scope = policy_scope(StaticPage).where(project_id: nil, code: 'custom').order(:created_at, :id)

      paginated_response(
        'custom_pages',
        scope,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::StaticPage,
        params: { current_user: }
      )
    end
  end
end
