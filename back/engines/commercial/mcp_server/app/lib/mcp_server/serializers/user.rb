# frozen_string_literal: true

class McpServer::Serializers::User < McpServer::Serializers::Base
  def attributes(record)
    record.slice(:id, :first_name, :last_name, :email, :roles)
  end
end
