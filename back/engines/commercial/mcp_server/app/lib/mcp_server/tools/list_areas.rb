# frozen_string_literal: true

class McpServer::Tools::ListAreas < McpServer::BaseTool
  def name = 'list_areas'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists geographic/administrative areas'
  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      paginated_response(
        'areas',
        Area.order(:ordering),
        **params.slice(:page, :per_page),
        serializer: McpServer::Serializers::Area,
        params: { current_user: }
      )
    end
  end
end
