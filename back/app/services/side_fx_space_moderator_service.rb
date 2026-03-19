class SideFxSpaceModeratorService
  include SideFxHelper

  def after_create(moderator, space, current_user)
    ::SideFxUserService.new.after_update moderator, current_user
    LogActivityJob.set(wait: 5.seconds).perform_later(
      moderator,
      'space_moderation_rights_received',
      current_user,
      Time.now.to_i,
      payload: { space_id: space.id }
    )
  end

  def after_destroy(moderator, space, current_user)
    ::SideFxUserService.new.after_update moderator, current_user
    LogActivityJob.perform_later(
      moderator,
      'space_moderation_rights_removed',
      current_user,
      Time.now.to_i,
      payload: { space_id: space.id }
    )
  end
end
