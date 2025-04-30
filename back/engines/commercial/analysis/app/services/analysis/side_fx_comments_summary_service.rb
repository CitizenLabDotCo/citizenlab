# frozen_string_literal: true

module Analysis
  class SideFxCommentsSummaryService
    include SideFxHelper

    def after_create(comments_summary, user)
      LogActivityJob.perform_later(comments_summary, 'created', user, comments_summary.created_at.to_i)
    end
  end
end
