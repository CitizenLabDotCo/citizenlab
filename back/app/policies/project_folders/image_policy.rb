# frozen_string_literal: true

module ProjectFolders
  class ImagePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(project_folder: scope_for(Folder))
      end
    end

    def create?
      policy_for(record.project_folder).update?
    end

    def show?
      policy_for(record.project_folder).show?
    end

    def update?
      policy_for(record.project_folder).update?
    end

    def destroy?
      policy_for(record.project_folder).update?
    end
  end
end
