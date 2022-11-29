# frozen_string_literal: true

class StatCommentPolicy < ApplicationPolicy
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

    def resolve_for_active
      user.admin? ? scope.all : resolve_for_project_moderator
    end

    def resolve_for_project_moderator
      return scope.none unless user.project_moderator?

      projects = ::ProjectPolicy::Scope.new(user, ::Project.all).resolve
      # we're deliberately avoiding to join ideas to the main scope itself,
      # because it conflicts with other queries modifying the scope (e.g.
      # filtering on projects)
      scope.where(post_type: 'Idea', post_id: Idea.where(project: projects))
    end
  end

  def ideas_count?
    show_stats?
  end

  def ideas_by_topic?
    show_stats?
  end

  def ideas_by_project?
    show_stats?
  end

  def ideas_by_time?
    show_stats?
  end

  def ideas_by_time_cumulative?
    show_stats?
  end

  def comments_count?
    show_stats?
  end

  def comments_by_time?
    show_stats?
  end

  def comments_by_time_cumulative?
    show_stats?
  end

  def comments_by_topic?
    show_stats?
  end

  def comments_by_project?
    show_stats?
  end

  def comments_by_time_as_xlsx?
    show_stats?
  end

  def comments_by_time_cumulative_as_xlsx?
    show_stats?
  end

  def comments_by_topic_as_xlsx?
    show_stats?
  end

  def comments_by_project_as_xlsx?
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
