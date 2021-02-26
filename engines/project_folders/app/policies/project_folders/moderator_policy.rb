module ProjectFolders
  class ModeratorPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        if user&.project_folder_moderator?
          moderated_folders = user.moderated_project_folders
          scope.project_folder_moderator(moderated_folders.pluck(:id))
        elsif user&.active? && user&.admin?
          scope.project_folder_moderator
        else
          raise Pundit::NotAuthorizedError, 'not allowed to view this action'
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
      user&.active? && user&.admin?
    end

    def destroy?
      create?
    end

    private

    def admin_or_moderator?
      # In the case of moderator, the user must be moderator of that project
      # (not just of any project).
      return unless user&.active?

      user.admin? || user.project_folder_moderator?(record.project_folder_id)
    end
  end
end
