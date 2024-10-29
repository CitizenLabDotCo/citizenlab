# frozen_string_literal: true

class InternalCommentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.active? && user&.admin?
        scope.all
      elsif user&.active? && user&.project_moderator?
        scope.where(post_id: Idea.where(project_id: user.moderatable_project_ids))
      else
        raise Pundit::NotAuthorizedError, 'not allowed to view this action'
      end
    end
  end

  def create?
    internal_commenter?
  end

  def children?
    internal_commenter?
  end

  def show?
    internal_commenter?
  end

  def update?
    internal_commenter? && internal_comment_author?
  end

  def mark_as_deleted?
    update?
  end

  def permitted_attributes_for_create
    %i[parent_id body]
  end

  def permitted_attributes_for_update
    internal_comment_author? ? [:body] : []
  end

  private

  def internal_commenter?
    if record.post_type == 'Idea'
      active? && (admin? || UserRoleService.new.can_moderate?(record.post, user))
    elsif record.post_type == 'Initiative'
      active? && admin?
    else
      false
    end
  end

  def internal_comment_author?
    return false if user.nil?

    record.author_id == user.id
  end
end
