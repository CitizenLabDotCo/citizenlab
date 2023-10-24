# frozen_string_literal: true

class MultiTenancy::Rake::ContinuousProjectMigrationService
  def initialize
    @stats = { projects: 0, success: 0, errors: [] }
  end

  attr_reader :stats

  def migrate(persist_changes)
    Rails.logger.info 'Migrating continuous forms.'
    Rails.logger.info "Persist: #{persist_changes}"

    projects = Project.where(process_type: 'continuous')
    @stats[:projects] = projects.count
    return unless persist_changes

    projects.each do |project|
      # 1. Change the process_type
      project.update!(process_type: 'timeline')

      # 2. Create a single phase with the same settings as the project
      phase = create_phase(project)
      project.phases << phase

      # TODO: Check that projects now has just one phase before continuing

      # 3. Update participation_context in models - from project_id to new phase_id
      update_participation_contexts(project, phase)

      # 4. Add phase_id to the following models:
      add_phase_ids(project, phase)

      # 5. Update permission_scope in permissions from project_id to phase_id
      update_permission_scope(project, phase)

      # 6. Add all ideas to the new phase
      add_ideas_to_phase(project, phase)

      # 7. Run function to update basket/votes count on ideas_phases
      update_counts(project)

      # 8. Add phase_id to creation_phase_id of any native_surveys
      update_native_survey_creation_phase(project, phase)

      # 9. Activities - Do we need to update any of the historic logs? If so we should run this as a separate task - could be huge

      @stats[:success] = @stats[:success] + 1
    end
  end

  private

  def create_phase(project)
    phase = Phase.new(
      title_multiloc: { en: 'default' }, # TODO: Set this to the participation method name - need the translations in the codebase for this
      project: project,
      created_at: project.created_at,
      start_at: project.created_at,
      end_at: nil,

      # TODO: Double check that these are all the setting that are the same + remove some from the project?
      participation_method: project.participation_method,
      posting_enabled: project.posting_enabled,
      posting_method: project.posting_method,
      posting_limited_max: project.posting_limited_max,
      commenting_enabled: project.commenting_enabled,
      reacting_enabled: project.reacting_enabled,
      reacting_like_method: project.reacting_like_method,
      reacting_like_limited_max: project.reacting_like_limited_max,
      reacting_dislike_method: project.reacting_dislike_method,
      reacting_dislike_limited_max: project.reacting_dislike_limited_max,
      survey_embed_url: project.survey_embed_url,
      survey_service: project.survey_service,
      presentation_mode: project.presentation_mode,
      voting_method: project.voting_method,
      voting_max_votes_per_idea: project.voting_max_votes_per_idea,
      voting_term_singular_multiloc: project.voting_term_singular_multiloc,
      voting_term_plural_multiloc: project.voting_term_plural_multiloc,
      voting_max_total: project.voting_max_total,
      voting_min_total: project.voting_min_total,
      ideas_count: project.ideas_count,
      baskets_count: project.baskets_count,
      votes_count: project.votes_count,
      poll_anonymous: project.poll_anonymous,
      ideas_order: project.ideas_order,
      input_term: project.input_term,
      document_annotation_embed_url: project.document_annotation_embed_url,
      allow_anonymous_participation: project.allow_anonymous_participation,
      campaigns_settings: { project_phase_started: true }
    )
    phase.save!
    phase
  end

  def update_participation_contexts(project, phase)
    # TODO: does this set the correct type as well?
    %w[Basket Polls::Question Polls::Response Surveys::Response Volunteering::Cause].each do |model|
      model.constantize.where(participation_context: project).update!(participation_context: phase)
    end
  end

  def add_phase_ids(project, phase)
    %w[Notification Analysis::Analysis].each do |model|
      model.constantize.where(project: project).update!(phase: phase)
    end
  end

  def update_permission_scope(project, phase)
    # TODO: does this set the correct type as well?
    Permission.where(permission_scope: project).update!(permission_scope: phase)
  end

  def add_ideas_to_phase(project, phase)
    # TODO: Add the number of objects updated into the stats
    Idea.where(project: project).update!(phase_ids: [phase.id])
  end

  def update_counts(phase)
    # TODO: How do we update idea counts?
    Basket.update_counts(phase, 'Phase')
  end

  def update_native_survey_creation_phase(project, phase)
    if phase.participation_method == 'native_survey'
      Idea.where(project: project).update!(creation_phase: phase)
    end
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end
end
