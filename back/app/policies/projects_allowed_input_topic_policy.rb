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

  def index?
    active_admin_or_moderator?
  end

  def show?
    active_admin_or_moderator?
  end

  def create?
    active_admin_or_moderator?
  end

  def reorder?
    active_admin_or_moderator?
  end

  def destroy?
    active_admin_or_moderator?
  end

  def permitted_attributes_for_create
    [
      :topic_id,
      :project_id
    ]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end

  private

  def active_admin_or_moderator?
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
  end
end
