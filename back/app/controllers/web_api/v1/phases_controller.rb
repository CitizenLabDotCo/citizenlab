# frozen_string_literal: true

class WebApi::V1::PhasesController < ApplicationController
  skip_before_action :authenticate_user
  around_action :detect_invalid_timeline_changes, only: %i[create update destroy]
  before_action :set_phase, only: %i[
    show show_mini update destroy survey_results survey_responses_pdf survey_response_fields
    survey_cover_preview sentiment_by_quarter submission_count index_xlsx delete_inputs
    show_progress common_ground_results
  ]
  before_action :ensure_survey_form, only: %i[
    survey_responses_pdf survey_response_fields survey_cover_preview
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
    phase_attributes = phase_params
    @phase = Phase.new(phase_attributes)
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
      @phase.ideas.each(&:destroy!) if @phase.pmethod.destroy_ideas_on_phase_destroy?

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

  # Lists the survey fields that will appear in the PDF export, flagging
  # registration/personal-data fields so the UI can pre-select them for
  # redaction. Source of truth for the export's field set.
  def survey_response_fields
    detector = Export::Pdf::PiiDetector.new
    data = Export::Pdf::SurveyFields.new(@phase).fields.map do |field|
      {
        id: field.key,
        type: 'survey_response_field',
        attributes: {
          title_multiloc: field.title_multiloc,
          personal_data: detector.personal_data?(field)
        }
      }
    end

    render json: { data: data }
  end

  # Generates a PDF of native survey responses (cover page + one card per
  # response). Field-level PII redaction is driven by `redacted_field_keys`.
  def survey_responses_pdf
    pdf = I18n.with_locale(current_user.locale) do
      Export::Pdf::SurveyResponsesGenerator.new(
        @phase,
        cover: cover_from_params,
        redacted_field_keys: params[:redacted_field_keys] || []
      ).generate_pdf
    end

    send_data pdf.read, type: 'application/pdf', filename: 'survey_responses.pdf'
  end

  # Renders just the cover page as HTML for the live preview, using the same
  # template the PDF uses (single source of truth, no response data, no PII).
  def survey_cover_preview
    html = I18n.with_locale(current_user.locale) do
      Export::Pdf::SurveyResponsesGenerator
        .new(@phase, cover: cover_from_params)
        .render_cover_html
    end

    # Returned as JSON (not text/html) so dev middleware like rack-mini-profiler
    # doesn't inject a <script> the sandboxed preview iframe would block.
    render json: { html: html }
  end

  def common_ground_results
    results = CommonGround::ResultsService.new(@phase).results

    render json: WebApi::V1::CommonGround::ResultsSerializer
      .new(results, params: jsonapi_serializer_params)
      .serializable_hash
  rescue CommonGround::Errors::UnsupportedPhaseError
    head :bad_request
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
  rescue CommonGround::Errors::UnsupportedPhaseError
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

  def ensure_survey_form
    head :unprocessable_entity unless @phase.pmethod.supports_survey_form?
  end

  def cover_from_params
    {
      include: ActiveModel::Type::Boolean.new.cast(params.dig(:cover, :include)),
      title: params.dig(:cover, :title).to_s,
      subtitle: params.dig(:cover, :subtitle).to_s,
      date: params.dig(:cover, :date).to_s,
      prepared_by: params.dig(:cover, :prepared_by).to_s,
      notes: params.dig(:cover, :notes).to_s
    }
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
      :voting_min_selected_options,
      :voting_filtering_enabled,
      :poll_anonymous,
      :document_annotation_embed_url,
      :ideas_order,
      :input_term,
      :vote_term,
      :prescreening_mode,
      :reacting_threshold,
      :expire_days_limit,
      :manual_voters_amount,
      :similarity_enabled,
      :survey_popup_frequency,
      :similarity_threshold_title,
      :similarity_threshold_body,
      {
        available_views: [],
        title_multiloc: CL2_SUPPORTED_LOCALES,
        description_multiloc: CL2_SUPPORTED_LOCALES,
        draft_description_multiloc: CL2_SUPPORTED_LOCALES,
        native_survey_title_multiloc: CL2_SUPPORTED_LOCALES,
        native_survey_button_multiloc: CL2_SUPPORTED_LOCALES
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
