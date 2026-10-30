# frozen_string_literal: true

class WebApi::V1::AIAssistant::ConversationsController < ApplicationController
  before_action { require_feature!('ai_assistant') }

  # The current user's conversations on a surface (e.g. the survey builder of a phase),
  # newest first.
  def index
    conversations = policy_scope(::AIAssistant::Conversation)
      .where(surface_key: params[:surface_key], subject_id: params[:subject_id])
      .order(created_at: :desc)
    conversations = paginate(conversations)

    render json: linked_json(conversations, serializer, params: jsonapi_serializer_params)
  end

  def show
    conversation = authorize(::AIAssistant::Conversation.includes(messages: :tool_calls).find(params[:id]))
    conversation.recover_if_stuck!
    render json: serialize(conversation)
  end

  # Starts a new conversation ("New chat"). Proposals left in the user's previous
  # conversations about the same record can no longer be decided on.
  def create
    surface_class = ::AIAssistant::Surface.find!(conversation_params[:surface_key])
    subject = surface_class.subject_class.find(conversation_params[:subject_id])
    conversation = ::AIAssistant::Conversation.new(
      user: current_user,
      subject:,
      surface_key: surface_class.key,
      locale: conversation_params[:locale]
    )
    authorize(conversation)

    if !surface_class.new(subject).available?
      render json: { errors: { base: [{ error: 'surface_unavailable' }] } }, status: :unprocessable_entity
    elsif AppConfiguration.instance.settings('core', 'locales').exclude?(conversation.locale)
      render json: { errors: { locale: [{ error: 'inclusion' }] } }, status: :unprocessable_entity
    else
      ActiveRecord::Base.transaction do
        previous_conversations(conversation).each(&:expire_proposals!)
        conversation.save!
      end
      render json: serialize(conversation), status: :created
    end
  rescue ::AIAssistant::Surface::UnknownKeyError
    skip_authorization
    render json: { errors: { surface_key: [{ error: 'inclusion' }] } }, status: :unprocessable_entity
  end

  private

  def conversation_params
    params.require(:ai_assistant_conversation).permit(:surface_key, :subject_id, :locale)
  end

  def previous_conversations(conversation)
    ::AIAssistant::Conversation.awaiting_approval.where(
      user: conversation.user,
      subject: conversation.subject,
      surface_key: conversation.surface_key
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
