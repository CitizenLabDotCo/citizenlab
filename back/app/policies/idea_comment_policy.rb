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
    active_moderator?
  end

  def create?
    (
      user&.active? &&
      (record.author_id == user.id) &&
      ProjectPolicy.new(user, record.post.project).show? &&
      check_commenting_allowed(record, user)
    ) || active_moderator?
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
    pcs = ParticipationPermissionsService.new
    !pcs.commenting_disabled_reason_for_idea comment.post, user
  end

  def active_moderator?
    return false unless active? && (admin? || user&.project_moderator?)

    # Needed to permit project moderator to export all comments,
    # without processing :idea_comment symbols for idea_comments from unmoderated projects.
    return true if record.instance_of?(Symbol)

    UserRoleService.new.can_moderate_project? record.post.project, user
  end
end
