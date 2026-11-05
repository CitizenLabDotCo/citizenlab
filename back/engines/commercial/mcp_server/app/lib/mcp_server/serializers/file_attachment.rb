# frozen_string_literal: true

class McpServer::Serializers::FileAttachment < McpServer::Serializers::Base
  wraps ::WebApi::V1::Files::FileAttachmentSerializer
end
