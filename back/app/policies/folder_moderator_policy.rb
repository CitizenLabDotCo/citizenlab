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
    admin_or_moderator?
  end

  def show?
    admin_or_moderator?
  end

  def create?
    admin_or_moderator?
  end

  def destroy?
    return false unless user&.active?
    return false if user.project_folder_moderator? # Currently, we don't allow FM to remove other FMS

    puts "UserRoleService.new.can_moderate?(record, user): #{UserRoleService.new.can_moderate?(record, user)}"

    user.admin? || UserRoleService.new.can_moderate?(record, user)
  end

  private

  def admin_or_moderator?
    return false unless user&.active?

    user.admin? || UserRoleService.new.can_moderate?(record, user)
  end
end
