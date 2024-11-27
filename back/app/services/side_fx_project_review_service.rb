# frozen_string_literal: true

class SideFxProjectReviewService < BaseSideFxService
  def after_update(project_review, user)
    LogActivityJob.perform_later(
      project_review,
      'changed',
      user,
      project_review.updated_at.to_i,
      payload: {
        resource_name => clean_time_attributes(project_review.attributes),
        change: project_review.saved_changes
      }
    )
  end

  private

  def resource_name
    :project_review
  end
end
