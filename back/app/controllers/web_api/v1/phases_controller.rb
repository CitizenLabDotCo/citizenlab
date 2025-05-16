# frozen_string_literal: true

class WebApi::V1::PhasesController < ApplicationController
  skip_before_action :authenticate_user
  around_action :detect_invalid_timeline_changes, only: %i[create update destroy]
  before_action :set_phase, only: %i[
    show show_mini update destroy survey_results sentiment_by_quarter
    submission_count index_xlsx delete_inputs show_progress common_ground_results
  ]

  def index
    @phases = policy_scope(Phase)
      .where(project_id: params[:project_id])
      .order(:start_at)
    @phases = paginate @phases
    @phases = @phases.includes(:permissions, :report, :custom_form, :manual_voters_last_updated_by)

    render json: linked_json(@phases, WebApi::V1::PhaseSerializer, params: jsonapi_serializer_params, include: %i[permissions manual_voters_last_updated_by])
  end

  def show
    render json: WebApi::V1::PhaseSerializer.new(@phase, params: jsonapi_serializer_params, include: %i[permissions]).serializable_hash
  end

  def show_mini
    render json: WebApi::V1::PhaseMiniSerializer.new(@phase, params: jsonapi_serializer_params).serializable_hash
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
    @phase.set_manual_voters(phase_params[:manual_voters_amount], current_user) if phase_params[:manual_voters_amount]
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
      @phase.ideas.each(&:destroy!) unless @phase.pmethod.transitive?

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
    results = if @phase.pmethod.class.method_str == 'community_monitor_survey'
      year = params[:year]
      quarter = params[:quarter]
      Surveys::ResultsWithDateGenerator.new(@phase, structure_by_category: true, year: year, quarter: quarter).generate_results
    else
      logic_ids = params[:filter_logic_ids].presence || [] # Array of page and option IDs
      Surveys::ResultsWithLogicGenerator.new(@phase).generate_results(logic_ids:)
    end

    render json: raw_json(results)
  end

  def common_ground_results
    render json: {
      data: {
        id: @phase.id,
        type: 'common_ground_results',
        attributes: {}
      }
    }
  end

  # Used for community_monitor_survey dashboard
  def sentiment_by_quarter
    average_generator = Surveys::AverageGenerator.new(@phase, input_type: 'sentiment_linear_scale')
    render json: raw_json(average_generator.summary_averages_by_quarter)
  end

  def submission_count
    count = if @phase.pmethod.supports_survey_form?
      @phase.ideas.supports_survey.published.count
    else
      @phase.ideas.transitive.published.count
    end

    render json: raw_json({ totalSubmissions: count })
  end

  def index_xlsx
    I18n.with_locale(current_user.locale) do
      xlsx = Export::Xlsx::InputsGenerator.new.generate_inputs_for_phase @phase.id
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

  def show_progress
    progress = CommonGround::ProgressService
      .new(@phase)
      .user_progress(current_user)

    render json: WebApi::V1::CommonGround::ProgressSerializer
      .new(progress, include: [:next_idea], params: jsonapi_serializer_params)
      .serializable_hash
  rescue CommonGround::ProgressService::UnsupportedPhaseError
    send_not_found
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
      :submission_enabled,
      :commenting_enabled,
      :autoshare_results_enabled,
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
      :prescreening_enabled,
      :reacting_threshold,
      :expire_days_limit,
      :manual_voters_amount,
      :similarity_enabled,
      :survey_popup_frequency,
      :similarity_threshold_title,
      :similarity_threshold_body,
      :user_fields_in_form,
      {
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_singular_multiloc: CL2_SUPPORTED_LOCALES,
        voting_term_plural_multiloc: CL2_SUPPORTED_LOCALES,
        native_survey_title_multiloc: CL2_SUPPORTED_LOCALES,
        native_survey_button_multiloc: CL2_SUPPORTED_LOCALES,
        campaigns_settings: Phase::CAMPAIGNS
      }
    ]
    if AppConfiguration.instance.feature_activated? 'disable_disliking'
      permitted += %i[reacting_dislike_enabled reacting_dislike_method reacting_dislike_limited_max]
    end
    params.require(:phase).permit(permitted)
  end

  def detect_invalid_timeline_changes
    project = if params[:project_id]
      Project.find(params[:project_id])
    else
      Phase.find(params[:id]).project
    end

    phases_before = project.phases.map(&:dup)
    valid_before = project.phases.all?(&:valid?)

    yield

    project.reload
    phases_after = project.phases
    valid_after = phases_after.all?(&:valid?)

    if valid_before && !valid_after
      ErrorReporter.report_msg(
        'request introduced invalid phases', extra: {
          project_id: project.id,
          phases_before: phases_before.sort_by(&:start_at).map(&:attributes),
          phases_after: phases_after.sort_by(&:start_at).map(&:attributes),
          params: params.to_unsafe_h
        }
      )
    end
  end
end

WebApi::V1::PhasesController.include(AggressiveCaching::Patches::WebApi::V1::PhasesController)
