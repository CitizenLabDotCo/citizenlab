# frozen_string_literal: true

class McpServer::Serializers::File < McpServer::Serializers::Base
  wraps ::WebApi::V1::FileV2Serializer
end
