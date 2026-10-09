# frozen_string_literal: true

# Built from scratch (no `wraps`): the web serializer exposes a `moderators` (User) relationship,
# so this returns only the id + title the events widget needs — no user data.
class McpServer::Serializers::Space < McpServer::Serializers::Base
  def attributes(record)
    { id: record.id, title_multiloc: record.title_multiloc }
  end
end
