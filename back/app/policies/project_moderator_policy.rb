# frozen_string_literal: true

class ProjectModeratorPolicy < ApplicationPolicy
  def index?
    admin_or_moderator?
  end

  def show?
    admin_or_moderator?
  end

  def create?
    admin_or_moderator?
  end

  def destroy?
    admin_or_moderator?
  end

  def users_search?
    admin_or_moderator?
  end

  private

  def admin_or_moderator?
    user&.active? && (
      user.admin? ||
      user.project_moderator?(record.project_id) ||
      (record.space_id.present? && user.space_moderator?(record.space_id))
    )
  end
end
