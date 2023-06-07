# frozen_string_literal: true

class WebApi::V1::VotesController < ApplicationController
  before_action :set_vote, only: %i[show destroy]
  before_action :set_votable_type_and_id, only: %i[index create up down]
  skip_before_action :authenticate_user

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  def index
    @votes = policy_scope(Vote, policy_scope_class: @policy_class::Scope)
      .where(votable_type: @votable_type, votable_id: @votable_id)
    @votes = paginate @votes

    render json: linked_json(@votes, WebApi::V1::VoteSerializer, params: jsonapi_serializer_params)
  end

  def show
    render json: WebApi::V1::VoteSerializer.new(@vote, params: jsonapi_serializer_params).serializable_hash
  end

  def create
    @vote = Vote.new(vote_params)
    @vote.votable_type = @votable_type
    @vote.votable_id = @votable_id
    @vote.user ||= current_user
    authorize @vote, policy_class: @policy_class

    SideFxVoteService.new.before_create(@vote, current_user)

    begin
      saved = @vote.save
    rescue ActiveRecord::RecordNotUnique => e
      # Case when uniqueness DB constraint is violated
      render json: { errors: { base: [{ error: e.message }] } }, status: :unprocessable_entity
      return
    end

    if saved
      SideFxVoteService.new.after_create(@vote, current_user)
      render json: WebApi::V1::VoteSerializer.new(
        @vote,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :created
    else
      render json: { errors: @vote.errors.details }, status: :unprocessable_entity
    end
  end

  def up
    upsert_vote 'up'
  end

  def down
    upsert_vote 'down'
  end

  def destroy
    SideFxVoteService.new.before_destroy(@vote, current_user)
    frozen_vote = @vote.destroy
    if frozen_vote
      SideFxVoteService.new.after_destroy(frozen_vote, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def upsert_vote(mode)
    @old_vote = Vote.find_by(
      user: current_user,
      votable_type: @votable_type,
      votable_id: @votable_id
    )

    if @old_vote && @old_vote.mode == mode
      authorize @old_vote, policy_class: @policy_class
      @old_vote.errors.add(:base, "already_#{mode}voted")
      render json: { errors: @old_vote.errors.details }, status: :unprocessable_entity
    else
      Vote.transaction do
        if @old_vote
          old_vote_frozen = @old_vote.destroy
          SideFxVoteService.new.after_destroy(old_vote_frozen, current_user)
        end
        @new_vote = Vote.new(
          user: current_user,
          votable_type: @votable_type,
          votable_id: @votable_id,
          mode: mode
        )
        authorize @new_vote, policy_class: @policy_class

        SideFxVoteService.new.before_create(@new_vote, current_user)

        if @new_vote.save
          SideFxVoteService.new.after_create(@new_vote, current_user)
          render json: WebApi::V1::VoteSerializer.new(
            @vote,
            params: jsonapi_serializer_params
          ).serializable_hash, status: :created
        else
          render json: { errors: @new_vote.errors.details }, status: :unprocessable_entity
        end
      end
    end
  end

  def set_votable_type_and_id
    @votable_type = params[:votable]
    @votable_id = params[:"#{@votable_type.underscore}_id"]
    @policy_class = case @votable_type
    when 'Idea' then IdeaVotePolicy
    when 'Comment' then CommentVotePolicy
    when 'Initiative' then InitiativeVotePolicy
    else raise "#{@votable_type} has no voting policy defined"
    end
    raise 'must not be blank' if @votable_type.blank? || @votable_id.blank?
  end

  def derive_policy_class(votable)
    case votable
    when Idea
      IdeaVotePolicy
    when Comment
      CommentVotePolicy
    when Initiative
      InitiativeVotePolicy
    else
      raise "Votable #{votable.class} has no voting policy defined"
    end
  end

  def set_vote
    @vote = Vote.find(params[:id])
    @policy_class = derive_policy_class(@vote.votable)
    authorize @vote, policy_class: @policy_class
  end

  def vote_params
    params.require(:vote).permit(:user_id, :mode)
  end
end
