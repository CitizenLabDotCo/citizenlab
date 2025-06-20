# frozen_string_literal: true

module Files
  class FilePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        active_admin? ? scope.all : scope.none
      end
    end

    def show?
      active_admin?
    end

    def create?
      active_admin? && record.uploader_id == user.id
    end

    def destroy?
      active_admin?
    end
  end
end
