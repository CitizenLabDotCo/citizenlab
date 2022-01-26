class SideFxProjectsAllowedInputTopicService
  include SideFxHelper

  def before_create projects_allowed_input_topic, user

  end

  def after_create projects_allowed_input_topic, user
    LogActivityJob.perform_later(projects_allowed_input_topic, 'created', user, projects_allowed_input_topic.created_at.to_i)
  end

  def before_update projects_allowed_input_topic, user

  end

  def after_update projects_allowed_input_topic, user
    LogActivityJob.perform_later(projects_allowed_input_topic, 'changed', user, projects_allowed_input_topic.updated_at.to_i)
  end

  def before_destroy projects_allowed_input_topic, user
  end

  def after_destroy frozen_projects_allowed_input_topic, user
    serialized_projects_allowed_input_topic = clean_time_attributes(frozen_projects_allowed_input_topic.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_projects_allowed_input_topic), 'deleted', user, Time.now.to_i, payload: {projects_allowed_input_topic: serialized_projects_allowed_input_topic})
  end

end