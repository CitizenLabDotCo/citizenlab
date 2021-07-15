module FlagInappropriateContent
  class SideFxInappropriateContentFlagService

    def after_mark_as_deleted flag, user
      LogActivityJob.perform_later(flag, 'marked_as_deleted', user, flag.updated_at.to_i)
    end

    def after_mark_as_flagged flag, user
      LogActivityJob.perform_later(flag, 'marked_as_flagged', user, flag.updated_at.to_i)
    end

  end
end