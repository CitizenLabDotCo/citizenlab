# frozen_string_literal: true

class WebApi::V1::ProjectGenerationsController < ApplicationController
  MAX_PROMPT_LENGTH = 5000

  # The four spectrums the manager confirms before generating, each sent as an index
  # (0, 1, 2). `format` steers method selection (open ideation vs private survey).
  LEVER_KEYS = %i[influence how_fixed reach format audience].freeze

  before_action { require_feature!('ai_project_generator') }
  before_action :set_project
  skip_after_action :verify_policy_scoped

  # Starts the generation in the background and returns its job tracker, which the
  # frontend polls through the jobs endpoint.
  def create
    authorize @project, :create?, policy_class: ProjectGeneration::ProjectGenerationPolicy
    files.each { |file| authorize file, :show? }

    errors = validation_errors
    if errors.present?
      render json: { errors: errors }, status: :unprocessable_entity
      return
    end

    # The lock makes the in-progress check + enqueue atomic across concurrent requests.
    tracker = begin
      CitizenLab::LockManager.try_with_transaction_lock("project_generation/#{@project.id}") do
        enqueue_job.tracker unless in_progress_tracker
      end
    rescue CitizenLab::LockManager::FailedToLock
      nil
    end

    if tracker
      render json: ::WebApi::V1::Jobs::TrackerSerializer.new(
        tracker,
        params: jsonapi_serializer_params
      ).serializable_hash, status: :accepted
    else
      render json: { errors: { base: [{ error: 'generation_in_progress' }] } }, status: :conflict
    end
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def generation_params
    params.require(:project_generation).permit(:prompt, :locale, file_ids: [], levers: LEVER_KEYS)
  end

  def prompt
    generation_params[:prompt].presence
  end

  def locale
    generation_params[:locale]
  end

  def file_ids
    generation_params[:file_ids] || []
  end

  # Levers missing from the request default to the middle stop; the service clamps them.
  def levers
    sent = generation_params[:levers] || {}
    LEVER_KEYS.index_with { |key| sent[key].to_i }
  end

  def files
    @files ||= Files::File.where(id: file_ids).to_a
  end

  def validation_errors
    errors = {}

    if prompt.nil? && file_ids.empty?
      errors[:prompt] = [{ error: 'blank' }]
    elsif prompt.to_s.length > MAX_PROMPT_LENGTH
      errors[:prompt] = [{ error: 'too_long', count: MAX_PROMPT_LENGTH }]
    end

    unless AppConfiguration.instance.settings('core', 'locales').include?(locale)
      errors[:locale] = [{ error: 'inclusion' }]
    end

    file_error = file_validation_error
    errors[:file_ids] = [{ error: file_error }] if file_error

    errors
  end

  def file_validation_error
    if files.size != file_ids.uniq.size || files.any? { |file| file.project_ids.exclude?(@project.id) }
      'not_found'
    elsif files.any? { |file| !file.ai_processing_allowed }
      'ai_processing_not_allowed'
    elsif files.any? { |file| ProjectGeneration::ProjectGenerator::FILE_EXTENSIONS.exclude?(::File.extname(file.name).downcase) }
      'unsupported_file_type'
    end
  end

  # A generation that is still running for this project, if any. Failed generations
  # complete their tracker, so they don't block a new one; the time window is a safety
  # valve against trackers orphaned by e.g. a dev environment without a running worker.
  def in_progress_tracker
    Jobs::Tracker
      .where(context: @project, root_job_type: ProjectGeneration::ProjectGenerationJob.name, completed_at: nil)
      .where(created_at: 1.hour.ago..)
      .first
  end

  def enqueue_job
    job = ProjectGeneration::ProjectGenerationJob
      .with_tracking(owner: current_user)
      .perform_later(@project, current_user, prompt, files, locale, levers)

    # The tracker's context is the project, but a Project has no `project_id`, so
    # with_tracking leaves the tracker's project_id blank. Set it so project
    # moderators (not just admins) can read the tracker through Jobs::TrackerPolicy.
    job.tracker.update!(project_id: @project.id)
    job
  end
end
