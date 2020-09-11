class PermissionPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.for_user(user)
    end
  end

  def show?
    user&.active? && (user.admin? || (record.permission_scope && user.project_moderator?(record.permission_scope.project.id)))
  end

  def update?
    user&.active? && (user.admin? || (record.permission_scope && user.project_moderator?(record.permission_scope.project.id)))
  end

  def participation_conditions?
    true # or user&.active?
  end

end
