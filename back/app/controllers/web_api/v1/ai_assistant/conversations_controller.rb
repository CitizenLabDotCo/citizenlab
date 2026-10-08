# frozen_string_literal: true

class WebApi::V1::AIAssistant::ConversationsController < ApplicationController
  before_action { require_feature!('ai_assistant') }

  # The current user's latest conversation in a context (e.g. the survey builder of a
  # phase), if any.
  def index
    conversations = policy_scope(::AIAssistant::Conversation)
      .where(context_key: params[:context_key], context_id: params[:context_id])
      .order(created_at: :desc)
      .limit(1)

    render json: serializer.new(conversations, params: jsonapi_serializer_params).serializable_hash
  end

  def show
    conversation = authorize(::AIAssistant::Conversation.includes(messages: :tool_calls).find(params[:id]))
    render json: serialize(conversation)
  end

  # Starts a new conversation ("New chat"). Proposals left in the user's previous
  # conversations about the same record can no longer be decided on.
  def create
    context_class = ::AIAssistant::Context.find!(conversation_params[:context_key])
    record = context_class.record_class.find(conversation_params[:context_id])
    conversation = ::AIAssistant::Conversation.new(
      user: current_user,
      context: record,
      context_key: context_class.key,
      locale: conversation_params[:locale]
    )
    authorize(conversation)

    if !context_class.new(record).available?
      render json: { errors: { base: [{ error: 'context_unavailable' }] } }, status: :unprocessable_entity
    elsif AppConfiguration.instance.settings('core', 'locales').exclude?(conversation.locale)
      render json: { errors: { locale: [{ error: 'inclusion' }] } }, status: :unprocessable_entity
    else
      ActiveRecord::Base.transaction do
        previous_conversations(conversation).each(&:expire_proposals!)
        conversation.save!
      end
      render json: serialize(conversation), status: :created
    end
  rescue KeyError
    skip_authorization
    render json: { errors: { context_key: [{ error: 'inclusion' }] } }, status: :unprocessable_entity
  end

  private

  def conversation_params
    params.require(:ai_assistant_conversation).permit(:context_key, :context_id, :locale)
  end

  def previous_conversations(conversation)
    ::AIAssistant::Conversation.awaiting_approval.where(
      user: conversation.user,
      context: conversation.context,
      context_key: conversation.context_key
    )
  end

  def serialize(conversation)
    serializer.new(
      conversation,
      params: jsonapi_serializer_params,
      include: %i[messages messages.tool_calls]
    ).serializable_hash
  end

  def serializer
    WebApi::V1::AIAssistant::ConversationSerializer
  end
end
