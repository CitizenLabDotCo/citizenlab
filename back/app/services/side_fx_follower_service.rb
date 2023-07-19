# frozen_string_literal: true

class SideFxFollowerService
  include SideFxHelper

  def before_create(follower, user); end

  def after_create(follower, user)
    LogActivityJob.perform_later follower, 'created', user, follower.created_at.to_i
  end

  def before_destroy(follower, user); end

  def after_destroy(frozen_follower, user)
    serialized_follower = clean_time_attributes frozen_follower.attributes
    LogActivityJob.perform_later(encode_frozen_resource(frozen_follower), 'deleted', user, Time.now.to_i, payload: { follower: serialized_follower })
  end
end
