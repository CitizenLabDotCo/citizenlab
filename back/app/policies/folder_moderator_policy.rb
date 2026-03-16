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
    user&.active? && user.admin?
  end

  def destroy?
    create?
  end

  private

  def active_and_can_moderate?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end
end
