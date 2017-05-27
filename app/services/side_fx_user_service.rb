class SideFxUserService

  include SideFxHelper

  def after_create user, current_user
    UserMailer.welcome(@user).deliver_later
    LogActivityJob.perform_later(user, 'created', current_user, user.created_at.to_i)
  end

  def after_update user, current_user
    if user.avatar_previously_changed?
      LogActivityJob.perform_later(user, 'changed', current_user, user.updated_at.to_i)
    end

  end

  def after_destroy frozen_user, current_user
    serialized_user = clean_time_attributes(frozen_user.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_user), 'deleted', current_user, Time.now.to_i, payload: {user: serialized_user})
  end

end