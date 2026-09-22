# frozen_string_literal: true

class McpServer::Serializers::Input < McpServer::Serializers::Base
  wraps ::WebApi::V1::IdeaSerializer

  def attributes(record)
    super.merge(**urls(record).compact)
  end
end
