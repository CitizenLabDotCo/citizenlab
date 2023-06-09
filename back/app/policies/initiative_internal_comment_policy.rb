# frozen_string_literal: true

class InitiativeInternalCommentPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      # If user active && admin then ...
      scope.where(post_type: 'Initiative')
      # else ...
      #   scope.none

      # else
      #   raise Pundit::NotAuthorizedError, 'not allowed to view this action'
      # end
    end
  end

  def create?
    active_admin?
  end

  def children?
    active_admin?
  end

  def show?
    active_admin?
  end

  def update?
    active_admin? && internal_comment_author?
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end

  def permitted_attributes_for_update
    attrs = %i[parent_id author_id]
    if record.author_id == user&.id
      attrs += [:body_text]
    end
    attrs
  end

  private

  def active_admin?
    user&.active? && user&.admin?
  end

  def internal_comment_author?
    record.author_id == user.id
  end
end
