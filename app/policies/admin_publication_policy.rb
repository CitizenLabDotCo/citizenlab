class AdminPublicationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication_type: ProjectFolder.name)
        .or(scope.where(publication: Pundit.policy_scope(user, Project)))
    end
  end

  def update?
    user&.active? && user.admin?
  end

  def reorder?
    update?
  end

  def permitted_attributes_for_update
    [:parent_id]
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
