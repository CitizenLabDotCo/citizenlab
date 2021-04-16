class StatIdeaPolicy < ApplicationPolicy
  def ideas_count?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_topic?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_area?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_status?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_status_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_project?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_topic_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_area_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_project_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time_cumulative_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end
end
