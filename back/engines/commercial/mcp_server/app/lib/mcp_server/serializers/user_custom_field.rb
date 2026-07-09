# frozen_string_literal: true

# Registration (user profile) fields. Not to be confused with Serializers::CustomField,
# which serializes form fields (options and matrix statements inlined).
class McpServer::Serializers::UserCustomField < McpServer::Serializers::Base
  def attributes(record)
    record.slice(:id, :title_multiloc, :input_type, :code, :required)
  end
end
