# frozen_string_literal: true

class McpServer::Serializers::PollQuestion < McpServer::Serializers::Base
  wraps ::Polls::WebApi::V1::QuestionSerializer
  inline :options
end
