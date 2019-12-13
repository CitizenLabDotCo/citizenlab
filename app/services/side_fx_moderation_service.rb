class SideFxModerationService
  include SideFxHelper

  def before_update moderation, user
    
  end

  def after_update moderation, user
    # TODO maybe improve log by status_changed or read or something
    LogActivityJob.perform_later(moderation, 'changed', user, moderation.updated_at.to_i)
  end

end