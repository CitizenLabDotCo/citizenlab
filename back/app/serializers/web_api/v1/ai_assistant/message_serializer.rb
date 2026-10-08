# frozen_string_literal: true

class WebApi::V1::AIAssistant::MessageSerializer < WebApi::V1::BaseSerializer
  set_type :ai_assistant_message

  attributes :role, :content, :position, :created_at

  has_many :tool_calls, serializer: WebApi::V1::AIAssistant::ToolCallSerializer
end
