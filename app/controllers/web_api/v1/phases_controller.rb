class WebApi::V1::PhasesController < ApplicationController
  before_action :set_phase, only: [:show, :update, :destroy]

  def index
    @phases = policy_scope(Phase)
      .where(project_id: params[:project_id])
      .order(:start_at)
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))

    render json: linked_json(@phases, WebApi::V1::PhaseSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::PhaseSerializer.new(@phase, params: fastjson_params).serialized_json
  end

  def create
    @phase = Phase.new(phase_params)
    @phase.project_id = params[:project_id]
    SideFxPhaseService.new.before_create(@phase, current_user)
    authorize @phase
    if @phase.save
      SideFxPhaseService.new.after_create(@phase, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@phase, params: fastjson_params).serialized_json, status: :created
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @phase.assign_attributes phase_params
    authorize @phase
    SideFxPhaseService.new.before_update(@phase, current_user)
    if @phase.save
      SideFxPhaseService.new.after_update(@phase, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@phase, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    SideFxPhaseService.new.before_destroy(@phase, current_user)
    phase = @phase.destroy
    if phase.destroyed?
      SideFxPhaseService.new.after_destroy(@phase, current_user)
      head :ok
    else
      head 500
    end
  end

  private

  def set_phase
    @phase = Phase.find params[:id]
    authorize @phase
  end

  def phase_params
    permitted = [
      :project_id,
      :start_at,
      :end_at,
      :participation_method,
      :posting_enabled,
      :commenting_enabled,
      :voting_enabled,
      :voting_method,
      :voting_limited_max,
      :presentation_mode,
      :survey_embed_url,
      :survey_service,
      :max_budget,
      :poll_anonymous,
      :ideas_order,
      :input_term,
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    ]
    permitted += [:downvoting_enabled] if AppConfiguration.instance.feature_activated? 'disable_downvoting'
    params.require(:phase).permit(permitted)
  end

  def secure_controller?
    false
  end
end
