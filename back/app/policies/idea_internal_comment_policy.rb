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
    active_admin_or_moderator?
  end

  def children?
    active_admin_or_moderator?
  end

  def show?
    active_admin_or_moderator?
  end

  def update?
    active_admin_or_moderator? && internal_comment_author?
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end

  private

  def active_admin_or_moderator?
    active? && (admin? || UserRoleService.new.can_moderate?(record.post, user))
  end

  def internal_comment_author?
    record.author_id == user.id
  end
end
