class SideFxTopicService
  include SideFxHelper

  def before_create(topic, user); end

  def after_create(topic, user)
    LogActivityJob.perform_later(topic, 'created', user, topic.created_at.to_i)
  end

  def before_update(topic, user); end

  def after_update(topic, user)
    LogActivityJob.perform_later(topic, 'changed', user, topic.updated_at.to_i)
  end

  def before_destroy(topic, user); end

  def after_destroy(frozen_topic, user)
    serialized_topic = clean_time_attributes(frozen_topic.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_topic), 'deleted', user, Time.now.to_i,
                                 payload: { topic: serialized_topic })
  end
end

SideFxTopicService.prepend_if_ee('SmartGroups::Patches::SideFxTopicService')
