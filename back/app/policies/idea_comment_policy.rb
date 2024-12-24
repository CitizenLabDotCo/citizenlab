# frozen_string_literal: true

class IdeaCommentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(post_id: scope_for(Idea))
    end
  end

  def index_xlsx?
    user&.admin? || user&.project_moderator?
  end

  def create?
    return false unless record.post

    (
      user&.active? &&
      (record.author_id == user.id) &&
      policy_for(record.post.project).show? &&
      check_commenting_allowed(record, user)
    ) || (
      user&.active? && UserRoleService.new.can_moderate?(record.post, user)
    )
  end

  def children?
    show?
  end

  def show?
    policy_for(record.post).show?
  end

  def update?
    create?
  end

  def mark_as_deleted?
    update?
  end

  def destroy?
    false
  end

  private

  def check_commenting_allowed(comment, user)
    !Permissions::IdeaPermissionsService.new(comment.post, user).denied_reason_for_action 'commenting_idea'
  end
end
