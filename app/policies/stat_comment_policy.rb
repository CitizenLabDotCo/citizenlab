class StatCommentPolicy < ApplicationPolicy

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
        projects = ProjectPolicy::Scope.new(user, Project.all).resolve
        scope.joins('FULL OUTER JOIN ideas ON ideas.id = comments.post_id').where(ideas: {project_id: projects})
          .or(scope.joins('FULL OUTER JOIN ideas ON ideas.id = comments.post_id').where(post_type: 'Initiative'))
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

  def ideas_by_project?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def ideas_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_count?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_time?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_time_cumulative?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_topic?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_project?
    user&.active? && (user.admin? || user.project_moderator?)
  end

end
