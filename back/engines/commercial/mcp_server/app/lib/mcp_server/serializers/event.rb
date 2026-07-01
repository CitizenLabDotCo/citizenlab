# frozen_string_literal: true

class McpServer::Serializers::Event < McpServer::Serializers::Base
  wraps ::WebApi::V1::EventSerializer
end
