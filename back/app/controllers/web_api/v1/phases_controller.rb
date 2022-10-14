# frozen_string_literal: true

class WebApi::V1::PhasesController < ::ApplicationController
  before_action :set_context, only: %i[show update destroy survey_results submission_count delete_inputs]
  skip_before_action :authenticate_user

  def index
    @phases = policy_scope(Phase)
      .where(project_id: params[:project_id])
      .order(:start_at)
    @phases = paginate @phases

    render json: linked_json(@phases, WebApi::V1::PhaseSerializer, params: fastjson_params)
  end

  def show
    render json: WebApi::V1::PhaseSerializer.new(@context, params: fastjson_params).serialized_json
  end

  def create
    @context = Phase.new(phase_params)
    @context.project_id = params[:project_id]
    sidefx.before_create(@context, current_user)
    authorize @context
    if @context.save
      sidefx.after_create(@context, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@context, params: fastjson_params).serialized_json, status: :created
    else
      render json: { errors: @context.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @context.assign_attributes phase_params
    authorize @context
    sidefx.before_update(@context, current_user)
    if @context.save
      sidefx.after_update(@context, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@context, params: fastjson_params).serialized_json, status: :ok
    else
      render json: { errors: @context.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    sidefx.before_destroy(@context, current_user)
    phase = @context.destroy
    if phase.destroyed?
      sidefx.after_destroy(@context, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def survey_results
    results = SurveyResultsGeneratorService.new(@context).generate_results
    render json: results
  end

  def submission_count
    count = SurveyResultsGeneratorService.new(@context).generate_submission_count
    render json: count
  end

  def delete_inputs
    sidefx.before_delete_inputs @context, current_user
    ActiveRecord::Base.transaction do
      @context.ideas.each(&:destroy!)
    end
    sidefx.before_delete_inputs @context, current_user
    head :ok
  end

  private

  def sidefx
    @sidefx ||= SideFxPhaseService.new
  end

  def set_context
    @context = Phase.find params[:id]
    authorize @context
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
      :upvoting_method,
      :upvoting_limited_max,
      :presentation_mode,
      :survey_embed_url,
      :survey_service,
      :min_budget,
      :max_budget,
      :poll_anonymous,
      :ideas_order,
      :input_term,
      { title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES }
    ]
    if AppConfiguration.instance.feature_activated? 'disable_downvoting'
      permitted += %i[downvoting_enabled downvoting_method downvoting_limited_max]
    end
    params.require(:phase).permit(permitted)
  end
end
