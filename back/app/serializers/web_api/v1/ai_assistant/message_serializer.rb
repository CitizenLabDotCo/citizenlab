# frozen_string_literal: true

class WebApi::V1::AIAssistant::MessageSerializer < WebApi::V1::BaseSerializer
  set_type :ai_assistant_message

  attributes :role, :content, :position, :created_at
end
