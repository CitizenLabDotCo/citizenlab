# frozen_string_literal: true

class IdeaInternalCommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      # Possibly need to include folder moderation in this (TBD), and need to also
      # handle fact that a user can be a moderator of projects and/or folders
      if user&.active? && user&.admin?
        scope.where(post_type: 'Idea')
      elsif user&.active? && user&.project_moderator?
        scope.where(post_id: Idea.where(project_id: user.moderatable_project_ids))
      else
        raise Pundit::NotAuthorizedError, 'not allowed to view this action'
      end
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
