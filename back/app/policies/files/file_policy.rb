# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      # TODO: Need to update this method with the same logic as the show method,
      # as signed out users now have access to some files (those attached to public content).
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
