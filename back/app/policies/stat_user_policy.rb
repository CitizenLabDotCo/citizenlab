# frozen_string_literal: true

class StatUserPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      user.admin? ? scope.all : resolve_for_project_moderator
    end

    def resolve_for_project_moderator
      return scope.none unless user.project_moderator?

      ::UserRoleService.new.moderatable_projects(user)
        .map { |project| ::ProjectPolicy::InverseScope.new(project, scope).resolve }
        .reduce(:or)
    end
  end

  def users_count?
    show_stats?
  end

  def users_by_time?
    show_stats?
  end

  def users_by_time_cumulative?
    show_stats?
  end

  def active_users_by_time?
    show_stats?
  end

  def active_users_by_time_cumulative?
    show_stats?
  end

  def users_by_time_as_xlsx?
    show_stats?
  end

  def users_by_time_cumulative_as_xlsx?
    show_stats?
  end

  def active_users_by_time_as_xlsx?
    show_stats?
  end

  private

  def show_stats?
    return unless active?

    show_stats_to_active?
  end

  def show_stats_to_active?
    admin? || user.project_moderator?
  end
end
