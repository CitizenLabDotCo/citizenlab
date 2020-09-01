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
        # we're deliberately avoiding to join ideas to the main scope itself,
        # because it conflicts with other queries modifying the scope (e.g.
        # filtering on projects)
        scope.where(post_type: 'Idea', post_id: Idea.where(project: projects))
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

  def comments_by_time_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_time_cumulative_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_topic_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

  def comments_by_project_as_xlsx?
    user&.active? && (user.admin? || user.project_moderator?)
  end

end
