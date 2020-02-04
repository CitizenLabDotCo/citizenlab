class ProjectFolderPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def create?
    user&.active? && user.admin?
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    user&.active? && user.admin?
  end
end
