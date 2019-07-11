class WebApi::V1::InitiativeStatusesController < ApplicationController
  before_action :set_initiative_status, only: [:show]

  def index
    @initiative_statuses = policy_scope(InitiativeStatus).order(:ordering)
    render json: @initiative_statuses
  end

  def show
    render json: @initiative_status
  end

  private

  def set_initiative_status
    @initiative_status = InitiativeStatus.find(params[:id])
    authorize @initiative_status
  end

  def secure_controller?
    false
  end
end
