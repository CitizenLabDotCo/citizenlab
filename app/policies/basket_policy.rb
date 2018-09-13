class BasketPolicy < ApplicationPolicy
  def create?
    user&.active? && (record.user_id == user.id || user.admin? || user.project_moderator?(record.participation_context.project.id))
  end

  def show?
    user&.active? && (record.user_id == user.id || user.admin? || user.project_moderator?(record.participation_context.project.id))
  end

  def update?
    user&.active? && (record.user_id == user.id || user.admin? || user.project_moderator?(record.participation_context.project.id))
  end

  def destroy?
    user&.active? && (record.user_id == user.id || user.admin? || user.project_moderator?(record.participation_context.project.id))
  end
end
