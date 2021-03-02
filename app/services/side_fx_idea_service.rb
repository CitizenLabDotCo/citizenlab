class SideFxIdeaService
  include SideFxHelper

  def initialize
    @automatic_assignment = false
  end

  def before_create(idea, user)
    before_publish idea, user if idea.published?
  end

  def after_create(idea, user)
    idea.update!(body_multiloc: TextImageService.new.swap_data_images(idea, :body_multiloc))
    after_publish idea, user if idea.published?
  end

  def before_update(idea, user)
    idea.body_multiloc = TextImageService.new.swap_data_images(idea, :body_multiloc)
    before_publish idea, user if idea.publication_status_change == %w[draft published]
  end

  def after_update(idea, user)
    if idea.publication_status_previous_change == %w[draft published]
      after_publish idea, user
    elsif idea.published?
      LogActivityJob.perform_later(idea, 'changed', user, idea.updated_at.to_i)
      scrape_facebook(idea)
    end

    if idea.idea_status_id_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_status', user, idea.updated_at.to_i,
                                   payload: { change: idea.idea_status_id_previous_change })
    end

    if idea.title_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_title', user, idea.updated_at.to_i,
                                   payload: { change: idea.title_multiloc_previous_change })
    end

    if idea.body_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_body', user, idea.updated_at.to_i,
                                   payload: { change: idea.body_multiloc_previous_change })
    end
  end

  def before_destroy(idea, _user)
    Tagging::Tagging.find(idea_id: idea.id).destroy_all
  rescue ActiveRecord::RecordNotFound => _e
  end

  def after_destroy(frozen_idea, user)
    serialized_idea = clean_time_attributes(frozen_idea.attributes)
    serialized_idea['location_point'] = serialized_idea['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_idea), 'deleted', user, Time.now.to_i,
                                 payload: { idea: serialized_idea })
  end

  private

  def before_publish(idea, _user)
    set_phase(idea)
  end

  def after_publish(idea, user)
    add_autovote idea
    log_activity_jobs_after_published idea, user
  end

  def set_phase(idea)
    return unless idea.project&.timeline? && idea.phases.empty?

    phase = TimelineService.new.current_and_future_phases(idea.project).find do |ph|
      ph&.can_contain_ideas?
    end
    idea.phases = [phase] if phase
  end

  def add_autovote(idea)
    pcs = ParticipationContextService.new
    return if pcs.voting_disabled_reason_for_idea(idea, idea.author)

    idea.votes.create!(mode: 'up', user: idea.author)
    idea.reload
  end

  def first_user_idea?(idea, user)
    (user.ideas.size == 1) && (user.ideas.first.id == idea.id)
  end

  def log_activity_jobs_after_published(idea, user)
    LogActivityJob.set(wait: 20.seconds).perform_later(idea, 'published', user, idea.published_at.to_i)
    scrape_facebook(idea)
    return unless first_user_idea?(idea, user)

    LogActivityJob.set(wait: 20.seconds).perform_later(idea, 'first_published_by_user', user, idea.published_at.to_i)
  end

  def scrape_facebook(idea)
    url = Frontend::UrlService.new.model_to_url(idea)
    Seo::ScrapeFacebookJob.perform_later(url)
  end
end
