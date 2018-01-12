class WebApi::V1::VotesController < ApplicationController
  before_action :set_vote, only: [:show, :destroy]
  before_action :set_votable_type_and_id, only: [:index, :create, :up, :down]

  def index
    @votes = policy_scope(Vote)
      .where(votable_type: @votable_type, votable_id: @votable_id)
      .includes(:user)
    render json: @votes, include: ['user']
  end

  def show
    render json: @vote, include: ['user']
  end

  def create
    @vote = Vote.new(vote_params)
    @vote.votable_type = @votable_type
    @vote.votable_id = @votable_id
    @vote.user ||= current_user
    authorize @vote

    SideFxVoteService.new.before_create(@vote, current_user)

    if @vote.save
      SideFxVoteService.new.after_create(@vote, current_user)
      render json: @vote, status: :created
    else
      render json: { errors: @vote.errors.details }, status: :unprocessable_entity
    end
  end

  def up
    upsert_vote "up"
  end

  def down
    upsert_vote "down"
  end

  def destroy
    SideFxVoteService.new.before_destroy(@vote, current_user)
    frozen_vote = @vote.destroy
    if frozen_vote
      SideFxVoteService.new.after_destroy(frozen_vote, current_user)
      head :ok
    else
      head 500
    end
  end

  private

  def upsert_vote mode

    @old_vote = Vote.find_by(
      user: current_user, 
      votable_type: @votable_type,
      votable_id: @votable_id
    )

    if @old_vote && @old_vote.mode == mode
      authorize @old_vote
      @old_vote.errors.add(:base, "already_#{mode}voted")
      render json: {errors: @old_vote.errors.details}, status: :unprocessable_entity
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
        authorize @new_vote

        SideFxVoteService.new.before_create(@new_vote, current_user)

        if @new_vote.save
          SideFxVoteService.new.after_create(@new_vote, current_user)
          render json: @vote, status: :created
        else
          render json: {errors: @new_vote.errors.details}, status: :unprocessable_entity
        end
      end
    end

  end

  def set_votable_type_and_id
    @votable_type = params[:votable]
    @votable_id = params[:"#{@votable_type.underscore}_id"]
    raise RuntimeError, "must not be blank" if @votable_type.blank? or @votable_id.blank?
  end

  def set_vote
    @vote = Vote.find(params[:id])
    authorize @vote
  end

  def vote_params
    params.require(:vote).permit(
      :user_id,
      :mode,
    )
  end

  def secure_controller?
    false
  end
end
