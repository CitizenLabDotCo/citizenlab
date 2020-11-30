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

        if user.project_folder_moderator?
          scope.project_folder_moderator(moderated_folders)
        else
          scope.project_folder_moderator
        end
      end
    end

    def initialize(user, args)
      @user = user
      @moderator, @moderatable = args
    end

    def create?
      manage?
    end

    def destroy?
      manage?
    end

    private

    def manage?
      user.active_and_admin? || user.project_folder_moderator?(@moderatable)
    end
  end
end
