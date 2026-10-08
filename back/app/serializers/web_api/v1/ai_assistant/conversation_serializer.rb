# frozen_string_literal: true

class WebApi::V1::AIAssistant::ConversationSerializer < WebApi::V1::BaseSerializer
  set_type :ai_assistant_conversation

  attributes :context_key, :locale, :status, :last_error_code, :created_at, :updated_at

  has_many :messages, serializer: WebApi::V1::AIAssistant::MessageSerializer
end
