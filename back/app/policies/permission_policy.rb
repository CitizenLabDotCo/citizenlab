# frozen_string_literal: true

class PermissionPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      return scope.none if !user&.active?

      if user.admin?
        scope.all
      else
        moderating_context_ids = ParticipationContextService.new.moderating_participation_context_ids user
        scope.where(permission_scope_id: moderating_context_ids)
      end
    end
  end

  def show?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def update?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def requirements?
    true
  end

  def schema?
    true
  end
end
