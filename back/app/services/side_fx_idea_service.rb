# frozen_string_literal: true

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
    before_publish idea, user if idea.will_be_published?
  end

  def after_update(idea, user)
    remove_user_from_past_activities_with_item(idea, user) if idea.anonymous_previously_changed?(to: true)

    if idea.just_published?
      after_publish idea, user
    elsif idea.published?
      LogActivityJob.perform_later(idea, 'changed', user_for_activity_on_anonymizable_item(idea, user), idea.updated_at.to_i)
      scrape_facebook(idea)
    end

    if idea.idea_status_id_previously_changed?
      LogActivityJob.perform_later(
        idea,
        'changed_status',
        user_for_activity_on_anonymizable_item(idea, user),
        idea.updated_at.to_i,
        payload: { change: idea.idea_status_id_previous_change }
      )
    end

    if idea.title_multiloc_previously_changed?
      LogActivityJob.perform_later(
        idea,
        'changed_title',
        user_for_activity_on_anonymizable_item(idea, user),
        idea.updated_at.to_i,
        payload: { change: idea.title_multiloc_previous_change }
      )
    end

    if idea.body_multiloc_previously_changed?
      LogActivityJob.perform_later(
        idea,
        'changed_body',
        user_for_activity_on_anonymizable_item(idea, user),
        idea.updated_at.to_i,
        payload: { change: idea.body_multiloc_previous_change }
      )
    end
  end

  def after_destroy(frozen_idea, user)
    serialized_idea = clean_time_attributes(frozen_idea.attributes)
    serialized_idea['location_point'] = serialized_idea['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_idea), 'deleted', user, Time.now.to_i,
      payload: { idea: serialized_idea })
  end

  private

  def before_publish(idea, _user); end

  def after_publish(idea, user)
    add_autoreaction idea
    create_followers idea, user
    log_activity_jobs_after_published idea, user
  end

  def add_autoreaction(idea)
    pcs = ParticipationContextService.new
    return if pcs.idea_reacting_disabled_reason_for idea, idea.author, mode: 'up'

    idea.reactions.create!(mode: 'up', user: idea.author)
    idea.reload
  end

  def log_activity_jobs_after_published(idea, user)
    LogActivityJob.set(wait: 20.seconds).perform_later(idea, 'published', user_for_activity_on_anonymizable_item(idea, user), idea.published_at.to_i)
    scrape_facebook(idea)
  end

  def scrape_facebook(idea)
    url = Frontend::UrlService.new.model_to_url(idea)
    url_with_utm = "#{url}?utm_source=share_idea&utm_campaign=share_content&utm_medium=facebook"
    Seo::ScrapeFacebookJob.perform_later(url_with_utm)
  end

  def create_followers(idea, user)
    Follower.find_or_create_by(followable: idea, user: user)
    Follower.find_or_create_by(followable: idea.project, user: user)
    return if !idea.project.in_folder?

    Follower.find_or_create_by(followable: idea.project.folder, user: user)
  end
end

SideFxIdeaService.prepend(FlagInappropriateContent::Patches::SideFxIdeaService)
SideFxIdeaService.prepend(IdeaAssignment::Patches::SideFxIdeaService)
