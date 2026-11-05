# frozen_string_literal: true

class McpServer::Serializers::Cause < McpServer::Serializers::Base
  wraps ::Volunteering::WebApi::V1::CauseSerializer

  def attributes(record) = super.merge(urls(record).compact)
end
