class StatIdeaPolicy < ApplicationPolicy

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.active? && user.admin?
        scope.all
      elsif user&.active? && user.project_moderator?
        projects = ProjectPolicy::Scope.new(user, Project.all).moderatable
        scope.where(project: projects)
      else
        scope.none
      end
    end
  end

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
