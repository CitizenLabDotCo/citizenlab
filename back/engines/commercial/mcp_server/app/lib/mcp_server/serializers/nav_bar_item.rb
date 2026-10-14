# frozen_string_literal: true

class McpServer::Serializers::NavBarItem < McpServer::Serializers::Base
  wraps ::WebApi::V1::NavBarItemSerializer

  def attributes(record)
    super.except(:created_at, :updated_at)
  end
end
