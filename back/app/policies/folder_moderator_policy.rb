# frozen_string_literal: true

class FolderModeratorPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.project_folder_moderator?
        moderated_folders = user.moderated_project_folders
        scope.project_folder_moderator(moderated_folders.pluck(:id))
      elsif user&.active? && user.admin?
        scope.project_folder_moderator
      else
        raise Pundit::NotAuthorizedError, 'not allowed to view this action'
      end
    end
  end

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
    return false unless has_role_higher_than_folder_moderator? # Currently, we don't allow FM to remove other FMS

    active_and_can_moderate?
  end

  private

  def active_and_can_moderate?
    return false unless user&.active?

    user.admin? || UserRoleService.new.can_moderate?(record, user)
  end

  def has_role_higher_than_folder_moderator?
    user&.admin? || user&.space_moderator?
  end
end
