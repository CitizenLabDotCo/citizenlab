# frozen_string_literal: true

class SideFxIdeaService
  include SideFxHelper

  def initialize
    @automatic_assignment = false
    @old_phase_ids = []
    @old_cosponsor_ids = []
  end

  def before_create(idea, user)
    before_publish_or_submit idea, user if idea.submitted_or_published?
  end

  def after_create(idea, user)
    idea.update!(body_multiloc: TextImageService.new.swap_data_images_multiloc(idea.body_multiloc, field: :body_multiloc, imageable: idea))
    idea.phases.each(&:update_manual_votes_count!) if idea.manual_votes_amount.present?

    LogActivityJob.perform_later(
      idea,
      'created',
      user_for_activity_on_anonymizable_item(idea, user),
      idea.updated_at.to_i,
      payload: { idea: serialize_idea(idea) }
    )

    after_submission idea, user if idea.submitted_or_published?
    after_publish idea, user if idea.published?
    enqueue_embeddings_job(idea)

    log_activities_if_cosponsors_added(idea, user)
  end

  def before_update(idea, user)
    @old_cosponsor_ids = idea.cosponsor_ids
    @old_phase_ids = idea.phase_ids
    idea.body_multiloc = TextImageService.new.swap_data_images_multiloc(idea.body_multiloc, field: :body_multiloc, imageable: idea)
    idea.publication_status = 'published' if idea.submitted_or_published? && idea.idea_status&.public_post?
    before_publish_or_submit idea, user if idea.will_be_submitted? || idea.will_be_published?
  end

  def after_update(idea, user)
    # We need to check if the idea was just submitted or just published before
    # we do anything else because updates to the idea can change this state.
    just_submitted = idea.just_submitted?
    just_published = idea.just_published?
    enabled_anonymous = idea.anonymous_previously_changed?(to: true)
    changed_manual_votes_amount = idea.manual_votes_amount_previously_changed?
    changed_phases = idea.phase_ids.sort != @old_phase_ids.sort

    remove_user_from_past_activities_with_item(idea, user) if enabled_anonymous
    Phase.where(id: [idea.phase_ids + @old_phase_ids].uniq).each(&:update_manual_votes_count!) if changed_manual_votes_amount || changed_phases

    after_submission idea, user if just_submitted
    if just_published
      after_publish idea, user
    elsif idea.published?
      change = idea.saved_changes
      payload = { idea: serialize_idea(idea) }
      payload[:change] = sanitize_change sanitize_location_point(change) if change.present?

      LogActivityJob.perform_later(
        idea,
        'changed',
        user_for_activity_on_anonymizable_item(idea, user),
        idea.updated_at.to_i,
        payload: payload
      )
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

    enqueue_embeddings_job(idea) if idea.title_multiloc_previously_changed? || idea.body_multiloc_previously_changed?

    if idea.manual_votes_amount_previously_changed?
      LogActivityJob.perform_later(
        idea,
        'changed_manual_votes_amount',
        user_for_activity_on_anonymizable_item(idea, user),
        idea.updated_at.to_i,
        payload: { change: idea.manual_votes_amount_previous_change }
      )
    end

    log_activities_if_cosponsors_added(idea, user)
  end

  def after_destroy(frozen_idea, user)
    frozen_idea.phases.each(&:update_manual_votes_count!) if frozen_idea.manual_votes_amount.present?

    # Refresh the count of project participants by clearing the cache
    ParticipantsService.new.clear_project_participants_count_cache(frozen_idea.project) if frozen_idea.project

    serialized_idea = serialize_idea(frozen_idea)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_idea),
      'deleted',
      user,
      Time.now.to_i,
      payload: { idea: serialized_idea },
      project_id: frozen_idea&.project&.id
    )
  end

  private

  def before_publish_or_submit(idea, _user); end

  def after_submission(idea, user)
    add_autoreaction(idea)
    create_followers(idea, user) unless idea.anonymous?
    LogActivityJob.set(wait: 20.seconds).perform_later(idea, 'submitted', user_for_activity_on_anonymizable_item(idea, user), idea.submitted_at.to_i)
  end

  def after_publish(idea, user)
    update_user_profile(idea, user)
    log_activity_jobs_after_published(idea, user)
  end

  def add_autoreaction(idea)
    return unless idea.author
    return unless idea.phases.any? { |phase| phase.pmethod.add_autoreaction_to_inputs? }
    return if Permissions::IdeaPermissionsService.new(idea, idea.author).denied_reason_for_action 'reacting_idea', reaction_mode: 'up'

    idea.reactions.create!(mode: 'up', user: idea.author) if !idea.reactions.exists?(mode: 'up', user: idea.author)
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
    return if idea.project.hidden?

    Follower.find_or_create_by(followable: idea, user: user) if idea.participation_method_on_creation.follow_idea_on_idea_submission?
    Follower.find_or_create_by(followable: idea.project, user: user)
    return if !idea.project.in_folder?

    Follower.find_or_create_by(followable: idea.project.folder, user: user)
  end

  def serialize_idea(frozen_idea)
    serialized_idea = clean_time_attributes(frozen_idea.attributes)
    serialized_idea['location_point'] = serialized_idea['location_point'].to_s

    serialized_idea
  end

  def sanitize_location_point(change)
    return change if change['location_point'].blank?

    geojson_change = change['location_point'].map { |point| RGeo::GeoJSON.encode(point) }

    # We encode the location_point to GeoJSON and then check for changes, else it would always be considered changed
    # when a location_point was set, due to the fact that the location_point previous change is encoded as
    # RGeo::Geographic::SphericalPointImpl, while the current change is encoded as RGeo::Geos::CAPIPointImpl.
    if geojson_change[0] == geojson_change[1]
      change.delete('location_point')
    else
      change['location_point'] = geojson_change
    end

    change
  end

  def log_activities_if_cosponsors_added(idea, user)
    added_ids = idea.cosponsors.map(&:id) - @old_cosponsor_ids
    if added_ids.present?
      new_cosponsorships = idea.cosponsorships.where(user_id: added_ids)
      new_cosponsorships.each do |cosponsorship|
        LogActivityJob.perform_later(
          cosponsorship,
          'created',
          user, # We don't want anonymized authors when cosponsors feature in use
          cosponsorship.created_at.to_i
        )
      end
    end
  end

  def enqueue_embeddings_job(idea)
    return if !AppConfiguration.instance.feature_activated?('input_iq') && AppConfiguration.timezone.at(Time.current).to_date > Date.parse('2025-06-30')
    return if !idea.participation_method_on_creation.supports_public_visibility?

    UpsertEmbeddingJob.perform_later(idea)
  end

  # update the user profile if user fields are changed as part of a survey
  def update_user_profile(idea, user)
    return unless user && idea.participation_method_on_creation.user_fields_in_form?

    user_values_from_idea = idea.custom_field_values.select { |key, _value| key.start_with?('u_') }.transform_keys { |key| key[2..] }
    user.update!(custom_field_values: user.custom_field_values.merge(user_values_from_idea))
  end
end

SideFxIdeaService.prepend(FlagInappropriateContent::Patches::SideFxIdeaService)
SideFxIdeaService.prepend(IdeaAssignment::Patches::SideFxIdeaService)
SideFxIdeaService.prepend(BulkImportIdeas::Patches::SideFxIdeaService)
