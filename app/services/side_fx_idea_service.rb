class SideFxIdeaService

  include SideFxHelper

  def before_create idea, user
    check_participation_context(idea, user)
    set_phase(idea)
  end

  def after_create idea, user
    if idea.published?
      add_autovote idea
      log_activity_jobs_after_published idea, user
    end
  end

  def after_update idea, user
    if idea.publication_status_previous_change == ['draft','published']
      add_autovote idea
      log_activity_jobs_after_published idea, user
    end

    if idea.idea_status_id_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_status', user, idea.updated_at.to_i, payload: {change: idea.idea_status_id_previous_change})
    end

    if idea.title_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_title', user, idea.updated_at.to_i, payload: {change: idea.title_multiloc_previous_change})
    end

    if idea.body_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_body', user, idea.updated_at.to_i, payload: {change: idea.body_multiloc_previous_change})
    end
  end


  def after_destroy frozen_idea, user
    serialized_idea = clean_time_attributes(frozen_idea.attributes)
    serialized_idea['location_point'] = serialized_idea['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_idea), 'deleted', user, Time.now.to_i, payload: {idea: serialized_idea})
  end


  private

  def check_participation_context idea, user
    pcs = ParticipationContextService.new
    project = idea.project
    if project
      disallowed_reason = pcs.posting_disabled_reason(project)
      if disallowed_reason
        raise ClErrors::TransactionError.new(error_key: disallowed_reason)
      end
    end
  end

  def set_phase idea
    if idea.project && idea.phases.empty?
      idea.phase_ids = [TimelineService.new.current_phase(idea.project)]
    end
  end

  def add_autovote idea
    project = idea.project
    pcs = ParticipationContextService.new
    if !pcs.voting_disabled_reason(project)
      idea.votes.create!(mode: 'up', user: idea.author)
      idea.reload
    end
  end

  def first_user_idea? idea, user
    (user.ideas.size == 1) && (user.ideas.first.id == idea.id)
  end

  def log_activity_jobs_after_published idea, user
    LogActivityJob.set(wait: 1.minutes).perform_later(idea, 'published', user, idea.created_at.to_i)
    LogActivityJob.set(wait: 1.minutes).perform_later(idea, 'first published by user', user, idea.created_at.to_i)
  end

end
