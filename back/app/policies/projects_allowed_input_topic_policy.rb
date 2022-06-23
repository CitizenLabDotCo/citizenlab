# frozen_string_literal: true

class ProjectsAllowedInputTopicPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(project: Pundit.policy_scope(user, Project))
    end
  end

  def create?
    user&.active? && UserRoleService.new.can_moderate_project?(record.project, user)
  end

  def reorder?
    user&.active? && UserRoleService.new.can_moderate_project?(record.project, user)
  end

  def destroy?
    user&.active? && UserRoleService.new.can_moderate_project?(record.project, user)
  end

  def permitted_attributes_for_create
    %i[topic_id project_id]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
