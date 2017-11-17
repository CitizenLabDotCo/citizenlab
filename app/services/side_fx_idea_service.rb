class SideFxIdeaService

  include SideFxHelper

  def after_create idea, user
    if idea.published?
      add_autovote idea
      log_activity_jobs_after_create idea, user
    end
  end

  def after_update idea, user
    if idea.publication_status_previous_change == ['draft','published']
      add_autovote idea
      log_activity_jobs_after_create idea, user
      LogActivityJob.perform_later(idea, 'published', user, idea.updated_at.to_i)
    end

    if idea.idea_status_id_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_status', user, idea.updated_at.to_i, payload: {code: idea&.idea_status&.code})
    end

    if idea.title_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_title', user, idea.updated_at.to_i)
    end

    if idea.body_multiloc_previously_changed?
      LogActivityJob.perform_later(idea, 'changed_body', user, idea.updated_at.to_i)
    end
  end


  def after_destroy frozen_idea, user
    serialized_idea = clean_time_attributes(frozen_idea.attributes)
    serialized_idea['location_point'] = serialized_idea['location_point'].to_s
    LogActivityJob.perform_later(encode_frozen_resource(frozen_idea), 'deleted', user, Time.now.to_i, payload: {idea: serialized_idea})
  end


  def add_autovote idea
    idea.votes.create!(mode: 'up', user: idea.author)
    idea.reload
  end

  def first_user_idea? idea, user
    (user.ideas.size == 1) && (user.ideas.first.id == idea.id)
  end

  def log_activity_jobs_after_create idea, user
    LogActivityJob.perform_later(idea, 'published', user, idea.created_at.to_i)
    if first_user_idea? idea, user
      idea_serializer = "Api::V1::IdeaSerializer".constantize
      idea_serialization = ActiveModelSerializers::SerializableResource.new(idea, {
        serializer: idea_serializer,
        adapter: :json
      })
      idea_image_serializer = "Api::V1::ImageSerializer".constantize
      idea_images_serializations = idea.idea_images.map{|i| ActiveModelSerializers::SerializableResource.new(i, {serializer: idea_image_serializer, adapter: :json})}
      LogActivityJob.perform_later(user, 'published first idea', user, idea.created_at.to_i,
        payload: { url: "#{Tenant.current.base_frontend_uri}/ideas/#{idea.slug}", user_email: user.email, 
                   idea: JSON.parse(idea_serialization.to_json).flatten.second,
                   idea_images: idea_images_serializations.map{ |iis| JSON.parse(iis.to_json).flatten.second } })
    end
  end

end