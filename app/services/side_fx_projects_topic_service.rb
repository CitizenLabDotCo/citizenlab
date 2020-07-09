class SideFxProjectsTopicService
  include SideFxHelper

  def before_create projects_topic, user

  end

  def after_create projects_topic, user
    LogActivityJob.perform_later(projects_topic, 'created', user, projects_topic.created_at.to_i)
  end

  def before_update projects_topic, user

  end

  def after_update projects_topic, user
    LogActivityJob.perform_later(projects_topic, 'changed', user, projects_topic.updated_at.to_i)
  end

  def before_destroy projects_topic, user
  end

  def after_destroy frozen_projects_topic, user
    serialized_projects_topic = clean_time_attributes(frozen_projects_topic.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_projects_topic), 'deleted', user, Time.now.to_i, payload: {projects_topic: serialized_projects_topic})
  end

end