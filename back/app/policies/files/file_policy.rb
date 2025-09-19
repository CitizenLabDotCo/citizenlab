# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      # NOTE: Normal users or visitors do not need to be able to list files, only file
      # attachments, as they contain all the file details relevant for the front-office.
      def resolve
        if active_admin?
          scope.all
        else
          moderated_projects = UserRoleService.new.moderatable_projects(user)
          scope.where(id: Files::FilesProject.where(project: moderated_projects).select(:file_id))
        end
      end
    end

    # NOTE: Normal users or visitors do not need to be able to show files, only file
    # attachments, as they contain all the file details relevant for the front-office.
    def show?
      return false unless active?
      return true if admin?

      UserRoleService.new.moderatable_projects(user, record.projects).exists?
    end

    def create?
      return false unless active?
      return false unless record.uploader_id == user.id # cannot upload file on behalf of another user

      admin? || user.project_or_folder_moderator? # Any elevated role can create
    end

    def update?
      return false unless active?
      return true if admin?

      user_moderates_all_projects?(record.projects)
    end

    def destroy?
      update?
    end

    private

    def user_moderates_all_projects?(projects)
      UserRoleService.new.moderatable_projects(user, projects).count == projects.count
    end
  end
end
