# frozen_string_literal: true

class WebApi::V1::ReactionsController < ApplicationController
  before_action :set_reaction, only: %i[show destroy]
  before_action :set_reactable_type_and_id, only: %i[index create up down]
  skip_before_action :authenticate_user

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    @reactions = policy_scope(Reaction, policy_scope_class: @policy_class::Scope)
      .where(reactable_type: @reactable_type, reactable_id: @reactable_id)
    @reactions = paginate @reactions

    render json: linked_json(@reactions, WebApi::V1::ReactionSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::ReactionSerializer.new(@reaction, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @reaction = Reaction.new(reaction_params)
    @reaction.reactable_type = @reactable_type
    @reaction.reactable_id = @reactable_id
    @reaction.user ||= current_user
    authorize @reaction, policy_class: @policy_class

    begin
      saved = @reaction.save
    rescue ActiveRecord::RecordNotUnique => e
      # Case when uniqueness DB constraint is violated
      render json: { errors: { base: [{ error: e.message }] } }, status: :unprocessable_entity
      return
    end

    if saved
      SideFxReactionService.new.after_create(@reaction, current_user)
      render json: WebApi::V1::ReactionSerializer.new(
        @reaction,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @reaction.errors.details }, status: :unprocessable_entity
    end
  end

  def up
    upsert_reaction 'up'
  end

  def down
    upsert_reaction 'down'
  end

  def destroy
    frozen_reaction = @reaction.destroy
    if frozen_reaction
      SideFxReactionService.new.after_destroy(frozen_reaction, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def upsert_reaction(mode)
    @old_reaction = Reaction.find_by(
      user: current_user,
      reactable_type: @reactable_type,
      reactable_id: @reactable_id
    )

    if @old_reaction && @old_reaction.mode == mode
      authorize @old_reaction, policy_class: @policy_class
      @old_reaction.errors.add(:base, mode == 'up' ? 'already_liked' : 'already_disliked')
      render json: { errors: @old_reaction.errors.details }, status: :unprocessable_entity
    else
      Reaction.transaction do
        if @old_reaction
          old_reaction_frozen = @old_reaction.destroy
          SideFxReactionService.new.after_destroy(old_reaction_frozen, current_user)
        end
        @new_reaction = Reaction.new(
          user: current_user,
          reactable_type: @reactable_type,
          reactable_id: @reactable_id,
          mode: mode
        )
        authorize @new_reaction, policy_class: @policy_class

        if @new_reaction.save
          SideFxReactionService.new.after_create(@new_reaction, current_user)
          render json: WebApi::V1::ReactionSerializer.new(
            @reaction,
            params: jsonapi_serializer_params
          ).serializable_hash, status: :created
        else
          render json: { errors: @new_reaction.errors.details }, status: :unprocessable_entity
        end
      end
    end
  end

  def set_reactable_type_and_id
    @reactable_type = params[:reactable]
    @reactable_id = params[:"#{@reactable_type.underscore}_id"]
    @policy_class = case @reactable_type
    when 'Idea' then IdeaReactionPolicy
    when 'Comment' then CommentReactionPolicy
    when 'Initiative' then InitiativeReactionPolicy
    else raise "#{@reactable_type} has no reaction policy defined"
    end
    raise 'must not be blank' if @reactable_type.blank? || @reactable_id.blank?
  end

  def derive_policy_class(reactable)
    case reactable
    when Idea
      IdeaReactionPolicy
    when Comment
      CommentReactionPolicy
    when Initiative
      InitiativeReactionPolicy
    else
      raise "reactable #{reactable.class} has no reaction policy defined"
    end
  end

  def set_reaction
    @reaction = Reaction.find(params[:id])
    @policy_class = derive_policy_class(@reaction.reactable)
    authorize @reaction, policy_class: @policy_class
  end

  def reaction_params
    params.require(:reaction).permit(:user_id, :mode)
  end
end
