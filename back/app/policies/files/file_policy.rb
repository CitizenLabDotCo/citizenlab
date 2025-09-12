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

      !user.normal_user? # Any elevated role can create
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
      project_ids = record.files_projects.filter_map(&:project_id)
      projects = Project.where(id: project_ids)

      (projects - UserRoleService.new.moderatable_projects(user)).empty?
    end
  end
end
