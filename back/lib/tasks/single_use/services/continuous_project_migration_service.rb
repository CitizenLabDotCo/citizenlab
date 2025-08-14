# frozen_string_literal: true

class Tasks::SingleUse::Services::ContinuousProjectMigrationService
  def initialize
    @stats = { projects: 0, success: 0, records_updated: 0, errors: [] }
  end

  attr_reader :stats

  def migrate(persist_changes)
    Rails.logger.info 'Migrating continuous projects.'
    Rails.logger.info "Persist: #{persist_changes}"

    projects = Project.where(process_type: 'continuous')
    @stats[:projects] = projects.count
    return unless persist_changes

    # TODO: Is there any impact on the updated_at dates changing?
    projects.each do |project|
      Rails.logger.info "MIGRATING PROJECT: #{project.slug}."

      # Catch validation error on some platforms
      if !project.admin_publication
        error_handler("#{project.slug} admin publication is blank.")
        next
      end

      # 1. Change the project process_type
      unless project.update(process_type: 'timeline')
        error_handler("#{project.slug} #{project.errors.details}")
        next
      end

      # 2. Create a single phase with the same settings as the project
      phase = create_phase(project)
      next unless phase

      reset_project_defaults(project)

      # 3. Update participation_context in models - from project_id to new phase_id
      update_participation_contexts(project, phase)

      # 4. Add phase to notifications where needed
      add_notification_phase_ids(project, phase)

      # 5. Update permission_scope in permissions from project_id to phase_id
      update_permission_scope(project, phase)

      # 6. Add phase_id to creation_phase_id of any native_surveys
      update_native_survey_creation_phase(project, phase)

      # 7. Add all ideas to the new phase
      add_ideas_to_phase(project, phase)

      # 8. Run function to update basket/votes count on ideas_phases
      update_counts(project)

      # 9. Move any native survey analysis from project to phase
      update_native_survey_analyses(project, phase)

      # 10. Update the custom_form context for native surveys
      update_survey_form_context(project, phase)

      # 11. Add a creation activity for each phase - don't think there are any other activities that need updating
      add_phase_creation_activity(phase)

      @stats[:success] = @stats[:success] + 1
    end
  end

  # Fix for staging - when the task was run with no logic
  def fix_survey_custom_forms
    CustomForm.where(participation_context_type: 'Project').each do |form|
      project = Project.find(form.participation_context_id)
      if project.phases.count == 1 && project.phases.first.participation_method == 'native_survey'
        form.update!(participation_context: project.phases.first)
        Rails.logger.info "FIXED: form for project: #{project.slug}"
      end
    end
  end

  private

  def create_phase(project)
    phase = Phase.new(
      title_multiloc: MultilocService.new.i18n_to_multiloc("phase_title_default.#{project.participation_method}"),
      project: project,
      created_at: project.created_at,
      start_at: project.created_at,
      end_at: nil,

      participation_method: project.participation_method,
      allow_anonymous_participation: project.allow_anonymous_participation,
      document_annotation_embed_url: project.document_annotation_embed_url,
      ideas_order: project.ideas_order,
      input_term: project.input_term,
      poll_anonymous: project.poll_anonymous,
      presentation_mode: project.presentation_mode,
      survey_embed_url: project.survey_embed_url,
      survey_service: project.survey_service,

      commenting_enabled: project.commenting_enabled,
      submission_enabled: project.submission_enabled,
      posting_method: project.posting_method,
      posting_limited_max: project.posting_limited_max,
      reacting_enabled: project.reacting_enabled,
      reacting_like_method: project.reacting_like_method,
      reacting_like_limited_max: project.reacting_like_limited_max,
      reacting_dislike_enabled: project.reacting_dislike_enabled,
      reacting_dislike_method: project.reacting_dislike_method,
      reacting_dislike_limited_max: project.reacting_dislike_limited_max,
      voting_method: project.voting_method,
      voting_max_votes_per_idea: project.voting_max_votes_per_idea,
      voting_max_total: project.voting_max_total,
      voting_min_total: project.voting_min_total,

      ideas_count: project.ideas_count,
      baskets_count: project.baskets_count,
      votes_count: project.votes_count
    )
    if phase.save
      project.phases << phase
      @stats[:records_updated] += 1
      phase
    else
      error_handler("#{project.slug} #{phase.errors.details}")
      false
    end
  end

  def reset_project_defaults(project)
    project.update!(
      participation_method: 'ideation',
      allow_anonymous_participation: false,
      document_annotation_embed_url: nil,
      ideas_order: nil,
      input_term: 'idea',
      poll_anonymous: false,
      presentation_mode: 'card',
      survey_embed_url: nil,
      survey_service: nil,

      commenting_enabled: true,
      submission_enabled: true,
      posting_method: 'unlimited',
      posting_limited_max: 1,
      reacting_enabled: true,
      reacting_like_method: 'unlimited',
      reacting_like_limited_max: 10,
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited',
      reacting_dislike_limited_max: 10,
      voting_method: nil,
      voting_max_votes_per_idea: nil,
      voting_max_total: 10,
      voting_min_total: 0,
      voting_term_singular_multiloc: {},
      voting_term_plural_multiloc: {}
    )
    @stats[:records_updated] += 1
  end

  def update_participation_contexts(project, phase)
    %w[Basket Polls::Question Polls::Response Surveys::Response Volunteering::Cause].each do |model|
      @stats[:records_updated] += model.constantize.where(participation_context: project).update!(participation_context: phase).count
    end
  end

  # Only two notification types need phase adding
  def add_notification_phase_ids(project, phase)
    %w[
      Notifications::VotingBasketNotSubmitted
      Notifications::VotingBasketSubmitted
    ].each do |model|
      @stats[:records_updated] += model.constantize.where(project: project).update!(phase: phase).count
    end
  end

  def update_permission_scope(project, phase)
    @stats[:records_updated] += Permission.where(permission_scope: project).update!(permission_scope: phase).count
  end

  def add_ideas_to_phase(project, phase)
    @stats[:records_updated] += Idea.where(project: project).update!(phase_ids: [phase.id]).count
  end

  def update_counts(phase)
    Basket.update_counts(phase, 'Phase')
  end

  def update_native_survey_creation_phase(project, phase)
    if phase.participation_method == 'native_survey'
      @stats[:records_updated] += Idea.where(project: project).update!(creation_phase: phase).count
    end
  end

  def update_native_survey_analyses(project, phase)
    if phase.participation_method == 'native_survey'
      @stats[:records_updated] += Analysis::Analysis.where(project: project).update!(phase: phase, project: nil).count
    end
  end

  def add_phase_creation_activity(phase)
    LogActivityJob.perform_later(phase, 'created', nil, phase.created_at.to_i, { payload: { migrated_from_continuous: true } })
  end

  def update_survey_form_context(project, phase)
    if phase.participation_method == 'native_survey'
      @stats[:records_updated] += CustomForm.where(participation_context: project).update!(participation_context: phase).count
    end
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end
end
