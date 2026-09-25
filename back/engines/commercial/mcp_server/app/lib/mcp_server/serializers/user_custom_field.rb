# frozen_string_literal: true

# Registration (user profile) fields. Not to be confused with Serializers::CustomField,
# which serializes form fields (options and matrix statements inlined).
class McpServer::Serializers::UserCustomField < McpServer::Serializers::Base
  def attributes(record)
    attrs = record.slice(:id, :title_multiloc, :input_type, :code, :required)
    return attrs unless record.input_type == 'select'

    # Options (with their keys) are needed to key a categorical reference distribution.
    attrs.merge(options: record.options.map { |option| { key: option.key, title_multiloc: option.title_multiloc } })
  end
end
