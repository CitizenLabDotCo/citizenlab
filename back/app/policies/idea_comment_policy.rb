# frozen_string_literal: true

class IdeaCommentPolicy < ApplicationPolicy
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

  def index_xlsx?
    user&.admin? || user&.project_moderator?
  end

  def create?
    (
      user&.active? &&
      (record.author_id == user.id) &&
      ProjectPolicy.new(user, record.post.project).show? &&
      check_commenting_allowed(record, user)
    ) || (
      user&.active? && UserRoleService.new.can_moderate?(record.post, user)
    )
  end

  def children?
    show?
  end

  def show?
    IdeaPolicy.new(user, record.post).show?
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
    pcs = ParticipationContextService.new
    !pcs.commenting_disabled_reason_for_idea comment.post, user
  end
end
