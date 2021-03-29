module Tagging
  class TagPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && (user&.admin? || user&.project_moderator?)
          scope.all
        else
          scope.none
        end
      end
    end

    def show?
      user&.active? && (user&.admin? || user&.project_moderator?)
    end

    def update?
      user&.active? && (user&.admin? || user&.project_moderator?)
    end

    def permitted_attributes
      [
        title_multiloc: CL2_SUPPORTED_LOCALES
      ]
    end
  end
end
