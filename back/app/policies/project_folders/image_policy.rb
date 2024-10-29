# frozen_string_literal: true

module ProjectFolders
  class ImagePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(project_folder: Pundit.policy_scope(user, Folder))
      end
    end

    def create?
      FolderPolicy.new(user, record.project_folder).update?
    end

    def show?
      FolderPolicy.new(user, record.project_folder).show?
    end

    def update?
      FolderPolicy.new(user, record.project_folder).update?
    end

    def destroy?
      FolderPolicy.new(user, record.project_folder).update?
    end
  end
end
