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

    def index?
      admin_or_moderator?
    end

    def show?
      admin_or_moderator?
    end

    def create?
      admin_or_moderator?
    end

    def destroy?
      admin_or_moderator?
    end

    def users_search?
      admin_or_moderator?
    end

    private

    def admin_or_moderator?
      # In the case of moderator, the user must be moderator of that project
      # (not just of any project).
      user.active_and_admin? || user.project_folder_moderator?(record.project_folder_id)
    end
  end
end
