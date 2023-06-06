# frozen_string_literal: true

class IdeaInternalCommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(post_id: Pundit.policy_scope(user, Idea))
    end
  end

  def create?
    (
      user&.active? && user&.admin?
    ) || (
      user&.active? && UserRoleService.new.can_moderate?(record.post, user)
    )
  end

  def children?
    show?
  end

  def show?
    (
      user&.active? && user&.admin?
    ) || (
      user&.active? && UserRoleService.new.can_moderate?(record.post, user)
    )
  end

  def update?
    (
      user&.active? && user&.admin?
    ) || (
      user&.active? && (record.author_id == user.id) && UserRoleService.new.can_moderate?(record.post, user)
    )
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end
end
