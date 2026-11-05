# frozen_string_literal: true

class SideFxDefaultInputTopicService
  include SideFxHelper

  def before_create(default_input_topic, user); end

  def after_create(default_input_topic, user)
    LogActivityJob.perform_later(default_input_topic, 'created', user, default_input_topic.created_at.to_i)
  end

  def before_update(default_input_topic, user); end

  def after_update(default_input_topic, user)
    LogActivityJob.perform_later(default_input_topic, 'changed', user, default_input_topic.updated_at.to_i)
  end

  def before_destroy(default_input_topic, user); end

  def after_destroy(frozen_default_input_topic, user)
    serialized_default_input_topic = clean_time_attributes(frozen_default_input_topic.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_default_input_topic),
      'deleted',
      user,
      Time.now.to_i,
      payload: { default_input_topic: serialized_default_input_topic }
    )
  end
end
