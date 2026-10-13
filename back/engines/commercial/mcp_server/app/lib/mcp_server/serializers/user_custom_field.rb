# frozen_string_literal: true

# Registration (user profile) fields. Not to be confused with Serializers::CustomField,
# which serializes form fields (options and matrix statements inlined).
class McpServer::Serializers::UserCustomField < McpServer::Serializers::Base
  def attributes(record)
    attrs = record.slice(:id, :title_multiloc, :input_type, :code, :required)
    # Options (with their keys) let an LLM key a categorical reference distribution. Inlined for
    # option-bearing fields that support a reference distribution — one step ahead of
    # set_reference_distribution, whose categorical path is select-only today (birthyear is binned,
    # with no options).
    return attrs unless record.supports_reference_distribution? && record.options.any?

    attrs.merge(options: record.options.map { |option| { key: option.key, title_multiloc: option.title_multiloc } })
  end
end
