# frozen_string_literal: true

class McpServer::Serializers::CustomField < McpServer::Serializers::Base
  wraps ::WebApi::V1::CustomFieldSerializer

  inline :options, :matrix_statements
end
