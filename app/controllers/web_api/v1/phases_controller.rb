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
    authorize @phase

    if @phase.save
      render json: @phase, status: :created
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    if @phase.update(phase_params)
      render json: @phase, status: :ok
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    @phase.destroy
    head :ok
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
      :survey_embed_url,
      :survey_service,
      title_multiloc: I18n.available_locales,
      description_multiloc: I18n.available_locales
    )
  end

  def secure_controller?
    false
  end
end
