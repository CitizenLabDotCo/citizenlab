# frozen_string_literal: true

class McpServer::Tools::ListGroups < McpServer::BaseTool
  def name = 'list_groups'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists user groups. Search by title.'

  def input_schema
    {
      properties: {
        search: { type: 'string', description: 'Search groups by title' },
        **PAGINATION_SCHEMA
      }
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      scope = Group.all
      scope = scope.search_by_title(params[:search]) if params[:search].present?

      paginated_response(
        'groups',
        scope.order_new,
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::Group
      )
    end
  end
end
