module ProjectFolders
  class FolderPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        scope.all
      end
    end

    def show?
      true
    end

    def by_slug?
      show?
    end

    def create?
      return unless user&.active?

      user.admin?
    end

    def update?
      return unless user&.active?

      create? || user&.project_folder_moderator?(record.id)
    end

    def destroy?
      create?
    end
  end
end
