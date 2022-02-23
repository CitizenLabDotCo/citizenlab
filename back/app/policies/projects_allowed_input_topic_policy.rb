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
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
  end

  def reorder?
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
  end

  def destroy?
    user&.active? && user&.active_admin_or_moderator?(record.project_id)
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
end
