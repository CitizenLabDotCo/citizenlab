# frozen_string_literal: true

# The tool's result and the pinned arguments stay on the server: they are only meant for
# the model and for running the tool.
class WebApi::V1::AIAssistant::ToolCallSerializer < WebApi::V1::BaseSerializer
  set_type :ai_assistant_tool_call

  attributes :name, :arguments, :status, :reason, :decided_at, :created_at
end
