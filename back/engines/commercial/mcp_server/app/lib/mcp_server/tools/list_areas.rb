# frozen_string_literal: true

class McpServer::Tools::ListAreas < McpServer::BaseTool
  def name = 'list_areas'
  def description = 'Lists geographic/administrative areas'
  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      paginated_response(
        'areas',
        Area.order(:ordering),
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc ordering]
      )
    end
  end
end
