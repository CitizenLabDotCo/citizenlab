# frozen_string_literal: true

class BaseSideFxService
  include SideFxHelper

  def before_create(resource, user); end

  def after_create(resource, user)
    LogActivityJob.perform_later(resource, 'created', user, resource.created_at.to_i)
  end

  def before_update(resource, user); end

  def after_update(resource, user)
    LogActivityJob.perform_later(resource, 'changed', user, resource.updated_at.to_i)
  end

  def before_destroy(resource, user); end

  def after_destroy(frozen_resource, user)
    serialized_resource = clean_time_attributes(frozen_resource.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_resource),
      'deleted', user, Time.now.to_i,
      payload: { resource_name => serialized_resource }
    )
  end

  private

  def resource_name
    raise NotImplementedError
  end
end
