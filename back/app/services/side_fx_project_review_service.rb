# frozen_string_literal: true

class SideFxProjectReviewService < BaseSideFxService
  def after_create(project_review, user)
    super

    project = project_review.project
    serialized_project = clean_time_attributes(project.attributes)

    LogActivityJob.perform_later(
      project,
      'project_review_requested',
      user, project_review.created_at.to_i,
      payload: {
        project_review_id: project_review.id,
        project: serialized_project
      }
    )
  end

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

    change = project_review.saved_changes['approved_at']
    if change && change[0].nil? && change[1].present?
      project = project_review.project
      serialized_project = clean_time_attributes(project.attributes)

      LogActivityJob.perform_later(
        project_review.project,
        'project_review_approved',
        user,
        project_review.updated_at.to_i,
        payload: {
          project_review_id: project_review.id,
          project: serialized_project
        }
      )
    end
  end

  private

  def resource_name
    :project_review
  end
end
