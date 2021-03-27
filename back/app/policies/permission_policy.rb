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
    user&.active_admin_or_moderator? record.permission_scope&.project&.id
  end

  def update?
    user&.active_admin_or_moderator? record.permission_scope&.project&.id
  end

  def participation_conditions?
    true
  end
end
