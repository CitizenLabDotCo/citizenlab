# frozen_string_literal: true

class McpServer::Serializers::Area < McpServer::Serializers::Base
  wraps ::WebApi::V1::AreaSerializer

  def attributes(record)
    super.except(:followers_count, :user_follower_id, :include_in_onboarding)
  end
end
