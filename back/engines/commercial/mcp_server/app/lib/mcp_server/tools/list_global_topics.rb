# frozen_string_literal: true

class McpServer::Tools::ListGlobalTopics < McpServer::BaseTool
  description 'Lists global topic categories for projects'
  input_schema(
    properties: {}
  )

  def self.call(server_context:)
    topics = GlobalTopic.order(:ordering)

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Found #{topics.size} global topics" }],
      structured_content: { global_topics: topics.as_json(only: %i[id title_multiloc icon]) }
    )
  end
end
