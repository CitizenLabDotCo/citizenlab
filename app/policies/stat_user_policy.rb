class StatUserPolicy < ApplicationPolicy

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.active? && user.admin?
        scope.all
      else user&.active? && user.project_moderator?
        projects = ProjectPolicy::Scope.new(user, Project.all).moderatable
        output = ProjectPolicy::InverseScope.new(projects.first, scope).resolve
        projects.drop(1).each do |project|
          output = output.or(ProjectPolicy::InverseScope.new(project, scope).resolve)
        end
        output
      end
    end
  end

  def users_count?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def active_users_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end
  
  def active_users_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_gender?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_birthyear?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_domicile?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_education?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_custom_field?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_engagement_scores?
    user&.active? && (user.admin? || user.project_moderator?)
  end
  def users_count?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_time_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_time_cumulative_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def active_users_by_time_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_gender_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_birthyear_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_domicile_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_education_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def users_by_custom_field_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

end
