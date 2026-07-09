# frozen_string_literal: true

class McpServer::Serializers::Phase < McpServer::Serializers::Base
  wraps ::WebApi::V1::PhaseSerializer

  def attributes(record) = super.merge(urls(record).compact)
end
