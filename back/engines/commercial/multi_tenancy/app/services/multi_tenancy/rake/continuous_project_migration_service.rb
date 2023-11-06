# frozen_string_literal: true

class MultiTenancy::Rake::ContinuousProjectMigrationService
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

    # TODO: Fail for the whole tenant if one thing fails?
    # TODO: Is there any impact on the updated_at dates changing?
    # TODO: Should we wrap each project in a transaction is that possible?
    projects.each do |project|
      Rails.logger.info "MIGRATING PROJECT: #{project.slug}."

      if !project.admin_publication
        error_handler("#{project.slug} admin publication is blank.")
        next
      end

      # 1. Change the process_type
      project.update!(process_type: 'timeline')

      # 2. Create a single phase with the same settings as the project
      phase = create_phase(project)
      project.phases << phase
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

      # 10. Add a creation activity for each phase - don't think there are any other activities that need updating
      add_phase_creation_activity(phase)

      @stats[:success] = @stats[:success] + 1
    end
  end

  private

  def create_phase(project)
    # If the project is published - use the date published as phase start date
    phase_start_at = project&.admin_publication&.published? ? project&.admin_publication&.updated_at : project.created_at
    phase = Phase.new(
      title_multiloc: create_phase_title(project),
      project: project,
      created_at: phase_start_at,
      start_at: project.created_at,
      end_at: nil,

      participation_method: project.participation_method,
      allow_anonymous_participation: project.allow_anonymous_participation,
      campaigns_settings: { project_phase_started: true },
      document_annotation_embed_url: project.document_annotation_embed_url,
      ideas_order: project.ideas_order,
      input_term: project.input_term,
      poll_anonymous: project.poll_anonymous,
      presentation_mode: project.presentation_mode,
      survey_embed_url: project.survey_embed_url,
      survey_service: project.survey_service,

      commenting_enabled: project.commenting_enabled,
      posting_enabled: project.posting_enabled,
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
      voting_term_singular_multiloc: project.voting_term_singular_multiloc,
      voting_term_plural_multiloc: project.voting_term_plural_multiloc,

      ideas_count: project.ideas_count,
      baskets_count: project.baskets_count,
      votes_count: project.votes_count
    )
    phase.save!
    phase
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
      posting_enabled: true,
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

  def create_phase_title(project)
    title_multiloc = {}
    AppConfiguration.instance.settings('core', 'locales').each do |locale|
      value = I18n.with_locale(locale) { I18n.t("default_phase_title.#{project.participation_method}") }
      title_multiloc[locale] = value
    end
    title_multiloc
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end
end
