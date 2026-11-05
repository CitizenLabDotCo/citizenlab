# frozen_string_literal: true

class McpServer::Serializers::PollOption < McpServer::Serializers::Base
  wraps ::Polls::WebApi::V1::OptionSerializer
end
