# frozen_string_literal: true

class McpServer::Serializers::Project < McpServer::Serializers::Base
  wraps ::WebApi::V1::ProjectSerializer

  def attributes(record) = super.merge(urls(record).compact)
end
