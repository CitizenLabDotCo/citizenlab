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
    return false unless user&.active?

    space_id =
      if record.respond_to?(:space_id)
        record.space_id
      elsif record.respond_to?(:project_folder_id)
        ProjectFolders::Folder.find_by(id: record.project_folder_id)&.space_id
      end

    user.admin? || user.space_moderator?(space_id)
  end

  def destroy?
    create?
  end

  private

  def admin_or_moderator?
    return unless user&.active?

    folder_id = if record.respond_to?(:folder)
                  record.folder&.id
                elsif record.respond_to?(:project_folder_id)
                  record.project_folder_id
                end

    space_id = if record.respond_to?(:space_id)
                record.space_id
              elsif record.respond_to?(:folder) && record.folder.respond_to?(:space_id)
                record.folder.space_id
              end

    user.admin? ||
      user.project_folder_moderator?(folder_id) ||
      user.space_moderator?(space_id)
  end
end
