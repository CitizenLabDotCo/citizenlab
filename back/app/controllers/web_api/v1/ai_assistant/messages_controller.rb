# frozen_string_literal: true

class WebApi::V1::AIAssistant::MessagesController < ApplicationController
  before_action { require_feature!('ai_assistant') }

  # Adds the user's message and starts the assistant's turn.
  def create
    conversation = ::AIAssistant::Conversation.find(params[:ai_assistant_conversation_id])
    message = conversation.messages.new(role: 'user', **message_params)
    authorize(message)

    status = conversation.with_lock do
      next :busy if conversation.running?
      next :invalid unless message.save

      conversation.update!(status: 'running', last_error_code: nil)
      ::AIAssistant::TurnJob.perform_later(conversation)
      :created
    end

    case status
    when :created
      render json: WebApi::V1::AIAssistant::MessageSerializer.new(message, params: jsonapi_serializer_params).serializable_hash, status: :created
    when :busy
      render json: { errors: { base: [{ error: 'conversation_busy' }] } }, status: :conflict
    else
      render json: { errors: message.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:ai_assistant_message).permit(:content).to_h.symbolize_keys
  end
end
