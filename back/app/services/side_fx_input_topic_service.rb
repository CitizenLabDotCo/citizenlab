# frozen_string_literal: true

class SideFxInputTopicService
  include SideFxHelper

  def before_create(input_topic, user); end

  def after_create(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'created', user, input_topic.created_at.to_i, project_id: input_topic.project_id)
  end

  def before_update(input_topic, user); end

  def after_update(input_topic, user)
    LogActivityJob.perform_later(input_topic, 'changed', user, input_topic.updated_at.to_i, project_id: input_topic.project_id)
  end

  def before_destroy(input_topic, user); end

  def after_destroy(frozen_input_topic, user)
    serialized_input_topic = clean_time_attributes(frozen_input_topic.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_input_topic),
      'deleted',
      user,
      Time.now.to_i,
      project_id: frozen_input_topic.project_id,
      payload: { input_topic: serialized_input_topic }
    )
  end
end
