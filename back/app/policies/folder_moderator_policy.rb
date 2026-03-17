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
    user&.active? && (user.admin? || user.space_moderator?(record&.space_id)) # does this make sense for space moderators? maybe not!
  end

  def destroy?
    create?
  end

  private

  def admin_or_moderator?
    # In the case of folder moderator, the user must be moderator of that project's folder
    # (not just of any project).
    return unless user&.active?

    user.admin? || user.project_folder_moderator?(record&.folder&.id) || user.space_moderator?(record&.space_id)
  end
end
