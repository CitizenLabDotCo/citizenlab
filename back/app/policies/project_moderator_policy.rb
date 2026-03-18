# frozen_string_literal: true

class ProjectModeratorPolicy < ApplicationPolicy
  def index?
    active_and_can_moderate?
  end

  def show?
    active_and_can_moderate?
  end

  def create?
    active_and_can_moderate?
  end

  def destroy?
    return false unless has_role_higher_than_project_moderator? # Currently, we don't allow PM to remove other PMs

    active_and_can_moderate?
  end

  def users_search?
    active_and_can_moderate?
  end

  private

  def active_and_can_moderate?
    return false unless user&.active?

    user.admin? || UserRoleService.new.can_moderate?(record, user)
  end

  def has_role_higher_than_project_moderator?
    user&.admin? || user&.project_folder_moderator? || user&.space_moderator?
  end
end
