class SideFxIdeaService

  include SideFxHelper

  def before_create idea, user
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

  def set_phase idea
    if idea.project&.timeline? && idea.phases.empty?
      idea.phases = [TimelineService.new.current_phase(idea.project)]
    end
  end

  def add_autovote idea
    pcs = ParticipationContextService.new
    if !pcs.voting_disabled_reason(idea)
      idea.votes.create!(mode: 'up', user: idea.author)
      idea.reload
    end
  end

  def first_user_idea? idea, user
    (user.ideas.size == 1) && (user.ideas.first.id == idea.id)
  end

  def log_activity_jobs_after_published idea, user
    LogActivityJob.set(wait: 1.minutes).perform_later(idea, 'published', user, idea.created_at.to_i)
    if first_user_idea?(idea, user)
      LogActivityJob.set(wait: 1.minutes).perform_later(idea, 'first published by user', user, idea.created_at.to_i)
    end
  end

end
