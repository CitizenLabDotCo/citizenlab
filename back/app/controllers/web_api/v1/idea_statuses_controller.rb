# frozen_string_literal: true

class WebApi::V1::IdeaStatusesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[index show]
  before_action :set_idea_status, except: %i[index create]

  def index
    @idea_statuses = policy_scope(IdeaStatus)
    apply_index_filters
    render json: serialize(@idea_statuses), status: :ok
  end

  def show
    render json: serialize(@idea_status), status: :ok
  end

  def create
    @idea_status = IdeaStatus.new(idea_status_params)
    authorize @idea_status
    if @idea_status.save
      SideFxIdeaStatusService.new.after_create(@idea_status, current_user)
      render json: serialize(@idea_status), status: :created
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    if @idea_status.update(idea_status_params)
      SideFxIdeaStatusService.new.after_update(@idea_status, current_user)
      render json: serialize(@idea_status), status: :ok
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    if @idea_status.insert_at(permitted_attributes(@idea_status)[:ordering])
      SideFxIdeaStatusService.new.after_update(@idea_status, current_user)
      render json: serialize(@idea_status), status: :ok
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    if @idea_status.proposed?
      render json: { errors: { base: 'Cannot delete the proposed status' } }, status: :unprocessable_entity
      return
    end
    frozen_idea_status = @idea_status.destroy
    if frozen_idea_status.destroyed?
      SideFxIdeaStatusService.new.after_destroy(frozen_idea_status, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  private

  def set_idea_status
    @idea_status = IdeaStatus.find(params[:id])
    authorize @idea_status
  end

  def serialize(record_or_records)
    WebApi::V1::IdeaStatusSerializer.new(record_or_records).serializable_hash
  end

  def apply_index_filters
    return if params[:participation_method].blank?
    @idea_statuses = @idea_statuses.where(participation_method: params[:participation_method])
  end

  def idea_status_params
    params.require(:idea_status).permit(
      :code, :color, :participation_method,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end
end
