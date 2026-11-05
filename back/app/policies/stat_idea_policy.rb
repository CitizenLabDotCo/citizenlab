# frozen_string_literal: true

class StatIdeaPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      user.admin? ? scope.all : resolve_for_moderator
    end

    def resolve_for_moderator
      return scope.none unless user.moderator?

      projects = ::UserRoleService.new.moderatable_projects user
      scope.where(project: projects)
    end
  end

  def ideas_by_topic?
    show_stats?
  end

  def ideas_by_project?
    show_stats?
  end

  def ideas_by_topic_as_xlsx?
    show_stats?
  end

  def ideas_by_project_as_xlsx?
    show_stats?
  end

  private

  def show_stats?
    return unless active?

    show_stats_to_active?
  end

  def show_stats_to_active?
    admin? || user.moderator?
  end
end
