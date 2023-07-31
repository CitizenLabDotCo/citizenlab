# frozen_string_literal: true

class WebApi::V1::PhasesController < ApplicationController
  before_action :set_phase, only: %i[show update destroy survey_results submission_count index_xlsx delete_inputs]
  skip_before_action :authenticate_user

  def index
    @phases = policy_scope(Phase)
      .includes(:permissions)
      .where(project_id: params[:project_id])
      .order(:start_at)
    @phases = paginate @phases

    render json: linked_json(@phases, WebApi::V1::PhaseSerializer, params: jsonapi_serializer_params, include: %i[permissions])
  end

  def show
    render json: WebApi::V1::PhaseSerializer.new(@phase, params: jsonapi_serializer_params, include: %i[permissions]).serializable_hash
  end

  def create
    @phase = Phase.new(phase_params)
    @phase.project_id = params[:project_id]
    sidefx.before_create(@phase, current_user)
    authorize @phase
    if @phase.save
      sidefx.after_create(@phase, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@phase, params: jsonapi_serializer_params).serializable_hash, status: :created
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def update
    @phase.assign_attributes phase_params
    authorize @phase
    sidefx.before_update(@phase, current_user)
    if @phase.save
      sidefx.after_update(@phase, current_user)
      render json: WebApi::V1::PhaseSerializer.new(@phase, params: jsonapi_serializer_params).serializable_hash, status: :ok
    else
      render json: { errors: @phase.errors.details }, status: :unprocessable_entity
    end
  end

  def destroy
    sidefx.before_destroy(@phase, current_user)
    phase = ActiveRecord::Base.transaction do
      participation_method = Factory.instance.participation_method_for @phase
      @phase.ideas.each(&:destroy!) if participation_method.delete_inputs_on_pc_deletion?

      @phase.destroy
    end
    if phase.destroyed?
      sidefx.after_destroy(@phase, current_user)
      head :ok
    else
      head :internal_server_error
    end
  end

  def survey_results
    results = SurveyResultsGeneratorService.new(@phase).generate_results
    render json: results
  end

  def submission_count
    count = SurveyResultsGeneratorService.new(@phase).generate_submission_count
    render json: count
  end

  def index_xlsx
    I18n.with_locale(current_user.locale) do
      include_private_attributes = Pundit.policy!(current_user, User).view_private_attributes?
      xlsx = XlsxExport::GeneratorService.new.generate_inputs_for_phase @phase.id, include_private_attributes
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'inputs.xlsx'
    end
  end

  def delete_inputs
    sidefx.before_delete_inputs @phase, current_user
    ActiveRecord::Base.transaction do
      @phase.ideas.each(&:destroy!)
    end
    sidefx.after_delete_inputs @phase, current_user
    head :ok
  end

  private

  def sidefx
    @sidefx ||= SideFxPhaseService.new
  end

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
      :posting_method,
      :posting_limited_max,
      :commenting_enabled,
      :reacting_enabled,
      :reacting_like_method,
      :reacting_like_limited_max,
      :allow_anonymous_participation,
      :presentation_mode,
      :survey_embed_url,
      :survey_service,
      :voting_method,
      :voting_max_total,
      :voting_min_total,
      :voting_max_votes_per_idea,
      :poll_anonymous,
      :document_annotation_embed_url,
      :ideas_order,
      :input_term,
      {
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_singular_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_plural_multiloc: CL2_SUPPORTED_LOCALES,
        campaigns_settings: Phase::CAMPAIGNS
      }
    ]
    if AppConfiguration.instance.feature_activated? 'disable_disliking'
      permitted += %i[reacting_dislike_enabled reacting_dislike_method reacting_dislike_limited_max]
    end
    params.require(:phase).permit(permitted)
  end
end
