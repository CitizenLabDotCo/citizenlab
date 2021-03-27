module Moderation
  class SideFxModerationStatusService
    include SideFxHelper

    def after_create moderation_status, user
      LogActivityJob.perform_later(moderation_status, moderation_status.status, user, moderation_status.updated_at.to_i)
    end

    def after_update moderation_status, user
      LogActivityJob.perform_later(moderation_status, moderation_status.status, user, moderation_status.updated_at.to_i)
    end

  end
end