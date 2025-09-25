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
      return true if admin?
      # TODO: Rework to allow regular users to upload idea files.
      #   Currently, idea files are still uploaded via the legacy endpoint/controller
      #   (+WebApi::V1::FilesController+) which relies on Files::FileAttachmentPolicy.
      return false unless user.project_or_folder_moderator?

      # Moderators are allowed to upload files only if they moderate all the projects
      # the file belongs to, or *if the file does not belong to any project* (a top-level
      # file). In the latter case, there is currently no way to browse or manage top-level
      # files in the application (this could be added in the future), but we needed to
      # allow their creation as a temporary state for new projects with files. In the
      # current implementation, the front end uploads any attached files before creating
      # the project itself. This means that at the time of upload, those files cannot yet
      # be linked to their destination project and remain in "limbo" until the project is
      # saved. At that point, the front end creates the project-file association. Note
      # that if the project creation is not completed, the files become inaccessible and
      # are not automatically cleaned up. That's the compromise we settled on for the time
      # being.
      #
      # Note: Getting the projects by querying `Project` directly instead of using
      # `record.projects` because +record.files_projects+ may not be persisted yet
      # (since this is a `create` action), which can cause issues with some SQL queries.
      projects = Project.where(id: record.project_ids)
      user_moderates_all_projects?(projects)
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
