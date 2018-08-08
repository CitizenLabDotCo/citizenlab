class WebApi::V1::PhasesController < ApplicationController
  before_action :set_phase, only: [:show, :update, :destroy]

  def index
    @phases = policy_scope(Phase)
      .where(project_id: params[:project_id])
      .page(params.dig(:page, :number))
      .per(params.dig(:page, :size))
      .order(:start_at)
    render json: @phases
  end

  def show
    render json: @phase
  end

  def create
    @phase = Phase.new(phase_params)
    @phase.project_id = params[:project_id]

    SideFxPhaseService.new.before_create(@phase, current_user)

    authorize @phase

    if @phase.save
      SideFxPhaseService.new.after_create(@phase, current_user)
      render json: @phase, status: :created
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @phase.assign_attributes(phase_params)

    SideFxPhaseService.new.before_update(@phase, current_user)

    if @phase.save
      SideFxPhaseService.new.after_update(@phase, current_user)
      render json: @phase, status: :ok
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
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
    @phase = Phase.find_by(id: params[:id])
    authorize @phase
  end

  def phase_params
    params.require(:phase).permit(
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
      title_multiloc: CL2_SUPPORTED_LOCALES,
      description_multiloc: CL2_SUPPORTED_LOCALES
    )
  end

  def secure_controller?
    false
  end
end
