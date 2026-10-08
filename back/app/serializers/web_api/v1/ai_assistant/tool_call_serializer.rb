# frozen_string_literal: true

# The tool's result stays on the server: it is only meant for the model.
class WebApi::V1::AIAssistant::ToolCallSerializer < WebApi::V1::BaseSerializer
  set_type :ai_assistant_tool_call

  attributes :name, :arguments, :status, :created_at
end
