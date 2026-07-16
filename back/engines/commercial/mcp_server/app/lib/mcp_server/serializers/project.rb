# frozen_string_literal: true

class McpServer::Serializers::Project < McpServer::Serializers::Base
  wraps ::WebApi::V1::ProjectSerializer

  # The web serializer exposes no groups relationship; surface the visibility
  # groups (visible_to 'groups') so the access configuration is readable.
  def attributes(record)
    super.merge(
      group_ids: record.group_ids,
      **urls(record).compact
    )
  end
end
