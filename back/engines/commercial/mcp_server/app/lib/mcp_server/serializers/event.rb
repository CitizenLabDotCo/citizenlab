# frozen_string_literal: true

class McpServer::Serializers::Event < McpServer::Serializers::Base
  wraps ::WebApi::V1::EventSerializer

  def attributes(record) = super.merge(urls(record).compact)
end
