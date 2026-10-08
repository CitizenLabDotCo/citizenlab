# frozen_string_literal: true

class WebApi::V1::AIAssistant::ToolCallsController < ApplicationController
  before_action { require_feature!('ai_assistant') }
  before_action :set_tool_call

  def approve
    render_decision(decider.approve!)
  end

  def reject
    render_decision(decider.reject!(params.dig(:ai_assistant_tool_call, :reason)))
  end

  private

  def set_tool_call
    @tool_call = authorize(::AIAssistant::ToolCall.find(params[:id]))
  end

  def decider
    ::AIAssistant::ToolCallDecider.new(@tool_call, current_user)
  end

  def render_decision(outcome)
    case outcome
    when :ok
      render json: WebApi::V1::AIAssistant::ToolCallSerializer.new(@tool_call.reload, params: jsonapi_serializer_params).serializable_hash
    when :expired
      render json: { errors: { base: [{ error: 'tool_call_expired' }] } }, status: :unprocessable_entity
    when :not_proposed
      render json: { errors: { base: [{ error: 'tool_call_not_proposed' }] } }, status: :conflict
    else
      render json: { errors: { base: [{ error: 'conversation_busy' }] } }, status: :conflict
    end
  end
end
