# frozen_string_literal: true

class McpServer::Tools::ListGlobalTopics < McpServer::BaseTool
  def name = 'list_global_topics'
  def annotations = READ_ANNOTATIONS
  def description = 'Lists global topic categories for projects'
  def input_schema = { properties: { **PAGINATION_SCHEMA } }

  class Runner < McpServer::BaseTool::Runner
    def run
      paginated_response(
        'global topics',
        GlobalTopic.order(:ordering),
        **params.slice(:page, :per_page),
        only: %i[id title_multiloc icon]
      )
    end
  end
end
