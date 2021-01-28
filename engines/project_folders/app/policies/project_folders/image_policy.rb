module ProjectFolders
  class ImagePolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

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
