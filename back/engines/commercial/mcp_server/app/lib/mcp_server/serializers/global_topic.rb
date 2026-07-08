# frozen_string_literal: true

class McpServer::Serializers::GlobalTopic < McpServer::Serializers::Base
  wraps ::WebApi::V1::GlobalTopicSerializer

  def attributes(record)
    super.except(:followers_count, :user_follower_id, :include_in_onboarding)
  end
end
