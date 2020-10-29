class AdminPublicationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(publication: Pundit.policy_scope(user, ProjectFolders::Folder))
        .or(scope.where(publication: Pundit.policy_scope(user, Project)))
    end
  end

  def show?
    Pundit.policy(user, record.publication).show?
  end

  def reorder?
    user&.active? && user.admin?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
