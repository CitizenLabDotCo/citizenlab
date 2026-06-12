# frozen_string_literal: true

class McpServer::Serializers::Project < McpServer::Serializers::Base
  wraps ::WebApi::V1::ProjectSerializer
end
