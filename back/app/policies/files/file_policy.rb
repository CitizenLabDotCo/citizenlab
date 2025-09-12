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

      # A files_project record is built in the controller #create action, but not yet persisted.
      project_ids = record.files_projects.filter_map(&:project_id)
      projects = Project.where(id: project_ids)
      moderates_all_projects?(projects)
    end

    def update?
      return false unless active?
      return true if admin?

      moderates_all_projects?
    end

    def destroy?
      update?
    end

    def moderates_all_projects?(projects = nil)
      projects ||= record.projects
      return false if projects.empty?

      (projects - UserRoleService.new.moderatable_projects(user)).empty?
    end
  end
end
