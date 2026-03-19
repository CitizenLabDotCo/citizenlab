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
    # In the case of moderator, the user must be moderator of the project
    # referenced (by project_id) in the Struct passed in.
    # This includes both project moderators and folder moderators of the project's folder,
    # even if the latter is not explicityly project_moderator of the project.
    user&.active? && (user&.admin? || user&.project_moderator?(record.project_id))
  end
end
