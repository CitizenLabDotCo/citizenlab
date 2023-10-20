# frozen_string_literal: true

class MultiTenancy::Rake::ContinuousProjectMigrationService
  def initialize
    @stats = { projects: 0, success: 0, errors: [] }
    @errors = []
  end

  attr_reader :stats

  def migrate(persist_changes)
    Rails.logger.info 'Migrating continuous forms.'
    Rails.logger.info "Persist: #{persist_changes}"

    projects = Project.where(process_type: 'continuous')
    @stats[:projects] = projects.count
    return unless persist_changes

    projects.each do |project|
      # Actually do the changes
      # 1. Change the process_type
      project.update!(process_type: 'timeline')

      # 2. Create a single phase with the same settings as the project
      phase = Phase.new(
        title_multiloc: { en: 'default' }, # TODO: Set this to the participation method name
        project: project,
        created_at: project.created_at,
        start_at: project.created_at,
        end_at: nil,
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
      project.phases << phase

      # 3. Copy the following project settings to the phase:
      # Check that all projects now have at least one phase
      # 2. Update participation_context in models - from project_id to new phase_id
      # 1. Basket
      # 2. PollsQuestion
      # 3. PollResponses
      # 4. SurveysResponses
      # 5. VolunteeringCauses
      #
      # 3. Add phase_id to the following models:
      #                                    1. AnalysisAnalysis - Not sure how this is used - check
      # 2. Notification
      #
      # 4. Update permission_scope in permissions from project_id to phase_id
      # 5. Add all ideas to the new phase
      # 1. Run function to update basket/votes count on ideas_phases
      # 6. Add phase_id to creation_phase_id of any native_surveys
      # 7. Activities - Do we need to update any of the historic logs? If so we should run this as a separate task - could be huge
    end
  end

  def error_handler(error)
    Rails.logger.error "ERROR: #{error}"
    @stats[:errors] << error
  end
end
