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
    @idea_status = IdeaStatus.new(idea_status_params_for_create)
    authorize @idea_status
    if IdeaStatus::LOCKED_CODES.include?(@idea_status.code)
      render json: { errors: { code: [{ error: 'Cannot create additional locked statuses', value: @idea_status.code }] } }, status: :unprocessable_entity
      return
    end
    if @idea_status.save
      SideFxIdeaStatusService.new.after_create(@idea_status, current_user)
      render json: serialize(@idea_status), status: :created
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    code_change = params.dig(:idea_status, :code) != @idea_status.code
    if code_change && @idea_status.locked?
      render json: { errors: { code: [{ error: 'Cannot change the code of locked statuses', value: @idea_status.code }] } }, status: :unprocessable_entity
      return
    end
    @idea_status.assign_attributes(idea_status_params_for_update)
    if code_change && @idea_status.locked?
      render json: { errors: { code: [{ error: 'Cannot set the code to a locked status code', value: @idea_status.code }] } }, status: :unprocessable_entity
      return
    end
    if @idea_status.save
      SideFxIdeaStatusService.new.after_update(@idea_status, current_user)
      render json: serialize(@idea_status), status: :ok
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def reorder
    ordering = params.require(:idea_status).permit(:ordering)[:ordering]
    if @idea_status.locked?
      render json: { errors: { base: 'Cannot reorder a locked status' } }, status: :unprocessable_entity
      return
    end
    if ordering <= max_ordering
      render json: { errors: { base: 'Cannot reorder into the locked statuses section' } }, status: :unprocessable_entity
      return
    end
    if @idea_status.insert_at(ordering)
      SideFxIdeaStatusService.new.after_update(@idea_status, current_user)
      render json: serialize(@idea_status), status: :ok
    else
      render json: { errors: @idea_status.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    if @idea_status.locked?
      render json: { errors: { base: 'Cannot delete a locked status' } }, status: :unprocessable_entity
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

  def idea_status_params_for_create
    params_attrs = [:participation_method, *shared_params]
    params.require(:idea_status).permit(params_attrs)
  end

  def idea_status_params_for_update
    params.require(:idea_status).permit(shared_params)
  end

  def shared_params
    [:code, :color, { title_multiloc: CL2_SUPPORTED_LOCALES, description_multiloc: CL2_SUPPORTED_LOCALES }]
  end

  def max_ordering
    IdeaStatus.where(code: IdeaStatus::LOCKED_CODES, participation_method: @idea_status.participation_method).maximum(:ordering) || -1
  end
end

WebApi::V1::IdeaStatusesController.include(AggressiveCaching::Patches::WebApi::V1::IdeaStatusesController)
