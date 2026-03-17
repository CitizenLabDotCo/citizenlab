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

  # Admin can always do everything with project moderators.
  # A project moderator can do everything for their project.
  # A space moderator can do everything for projects in their space.
  # TODO: Include FM of project's folder, now we cannot rely on them have PM role for all projects in the folder
  def admin_or_moderator?
    return false unless user&.active?

    project_id = if record.respond_to?(:project_id)
      record.project_id
    elsif record.respond_to?(:id)
      record.id
    end

    space_id = if record.respond_to?(:space_id)
      record.space_id
    elsif project_id
      Project.find_by(id: project_id)&.space_id
    end

    user.admin? ||
      user.project_moderator?(project_id) ||
      (space_id.present? && user.space_moderator?(space_id))
  end
end
