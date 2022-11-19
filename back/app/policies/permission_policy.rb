# frozen_string_literal: true

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
    user&.active? && UserRoleService.new.can_moderate?(record.permission_scope, user)
  end

  def update?
    user&.active? && UserRoleService.new.can_moderate?(record.permission_scope, user)
  end

  def participation_conditions?
    true
  end
end
