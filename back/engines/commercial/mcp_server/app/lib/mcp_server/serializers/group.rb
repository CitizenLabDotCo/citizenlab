# frozen_string_literal: true

class McpServer::Serializers::Group < McpServer::Serializers::Base
  def attributes(record)
    record.slice(:id, :title_multiloc, :membership_type, :memberships_count)
  end
end
