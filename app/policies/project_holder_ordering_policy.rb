class ProjectHolderOrderingPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(project_holder_type: 'ProjectFolder')
        .or(scope.where(project_holder: Pundit.policy_scope(user, Project)))
    end
  end

  def reorder?
    user&.active? && user.admin?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
