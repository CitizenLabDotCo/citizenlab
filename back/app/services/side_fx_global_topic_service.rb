# frozen_string_literal: true

class SideFxGlobalTopicService
  include SideFxHelper

  def before_create(global_topic, user); end

  def after_create(global_topic, user)
    LogActivityJob.perform_later(global_topic, 'created', user, global_topic.created_at.to_i)
  end

  def before_update(global_topic, user); end

  def after_update(global_topic, user)
    LogActivityJob.perform_later(global_topic, 'changed', user, global_topic.updated_at.to_i)
  end

  def before_destroy(global_topic, user); end

  def after_destroy(frozen_global_topic, user)
    serialized_global_topic = clean_time_attributes(frozen_global_topic.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_global_topic), 'deleted', user, Time.now.to_i,
      payload: { global_topic: serialized_global_topic })
  end
end

SideFxGlobalTopicService.prepend(SmartGroups::Patches::SideFxGlobalTopicService)
