# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      # NOTE: Normal users or visitors do not need to list files, only file attachments,
      # as they contain all the file details relevant for the front-office.
      def resolve
        if active_admin?
          scope.all
        else
          moderated_projects = UserRoleService.new.moderatable_projects(user)
          scope.where(id: Files::FilesProject.where(project: moderated_projects).select(:file_id))
        end
      end
    end

    def show?
      return true if admin?

      if user&.project_or_folder_moderator?
        # Can the user moderate at least one of the associated projects
        return UserRoleService.new.moderatable_projects(user, record.projects).exists?
      end

      # Can the user see whatever the file is attached to
      record.attachments.any? do |attachment|
        policy_for(attachment.attachable).show?
      end
    end

    def create?
      return false unless active?
      return false unless record.uploader_id == user.id # cannot upload file on behalf of another user

      admin? || user.project_or_folder_moderator? # Any elevated role can create
    end

    def update?
      return false unless active?
      return true if admin?

      moderates_all_projects?
    end

    def destroy?
      update?
    end

    private

    def moderates_all_projects?
      projects = Project.where(id: record.project_ids)
      (projects - UserRoleService.new.moderatable_projects(user)).empty?
    end
  end
end
