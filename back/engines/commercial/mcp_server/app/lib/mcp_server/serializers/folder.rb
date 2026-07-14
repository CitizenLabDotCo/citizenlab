# frozen_string_literal: true

class McpServer::Serializers::Folder < McpServer::Serializers::Base
  wraps ::WebApi::V1::FolderSerializer

  def attributes(record) = super.merge(urls(record).compact)
end
