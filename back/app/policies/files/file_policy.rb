# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
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
      return false unless active?
      return true if admin?

      UserRoleService.new.moderatable_projects(user, record.projects).exists?
    end

    def create?
      return false unless active?
      return false unless record.uploader_id == user.id # cannot upload file on behalf of another user
      return true if admin?

      # If the file is attached to other models immediately during creation, check that
      # the user has permission to create those attachments. Note that this may be
      # redundant since:
      # - attempting to attach the file to resources in other projects would make the file invalid
      # - and we also verify that the user moderates all the file's projects
      # However, future changes/refactorings could break these assumptions, so we err on
      # the side of caution.
      attachments = record.attachments
      return false if attachments.any? { |att| !policy_for(att).create? }

      # Allow creation only if the user moderates all associated projects.
      #
      # Note: Getting the projects by querying `Project` directly instead of using
      # `record.projects` because +record.files_projects+ may not be persisted yet
      # (since this is a `create` action), which can cause issues with some SQL queries.
      projects = Project.where(id: record.project_ids)
      return false if projects.empty?

      UserRoleService.new.moderatable_projects(user, projects).count == projects.count
    end

    def update?
      return false unless active?
      return true if admin?

      # Allow update if the user moderates at least one of the associated projects.
      UserRoleService.new.moderatable_projects(user, record.projects).exists?
    end

    def destroy?
      active_admin?
    end
  end
end
