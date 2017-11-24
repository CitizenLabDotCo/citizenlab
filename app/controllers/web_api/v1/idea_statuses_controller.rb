class WebApi::V1::IdeaStatusesController < ApplicationController
  before_action :set_idea_status, only: [:show]

  def index
    @idea_statuses = policy_scope(IdeaStatus).order(:ordering)
    render json: @idea_statuses
  end

  def show
    render json: @idea_status
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end

  def secure_controller?
    false
  end
end
