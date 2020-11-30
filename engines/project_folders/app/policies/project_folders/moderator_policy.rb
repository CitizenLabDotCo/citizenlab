module ProjectFolders
  class ModeratorPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        raise Pundit::NotAuthorizedError, 'not allowed to view this action' if user.normal?

        moderated_folders = user.moderated_project_folders

        user.project_folder_moderator? ? scope.project_folder_moderator(moderated_folders) : scope.all
      end
    end

    def create?
      user.active_and_admin?
    end

    def destroy?
      user.active_and_admin?
    end
  end
end
