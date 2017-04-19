class Api::V1::VotesController < ApplicationController
  before_action :set_votable_type_and_id, only: [:index, :create]
  before_action :set_vote, only: [:show, :destroy]

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

    if @vote.save
      render json: @vote, status: :created, include: ['user']
    else
      render json: { errors: @vote.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @vote.destroy
    head :ok
  end

  private
  def set_votable_type_and_id
    @votable_type = params[:votable]
    @votable_id = params[:"#{@votable_type.downcase}_id"]
    raise RuntimeError, "must not be blank" if @votable_type.blank? or @votable_id.blank?
  end

  def set_vote
    @vote = Vote.find_by(id: params[:id])
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
