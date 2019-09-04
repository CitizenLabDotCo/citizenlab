module Polls
  class QuestionPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        # TODO: Only when you have access to the PC
        scope.all
      end
    end

    def create?
      user&.active? && (user.admin? || user.project_moderator?(record.participation_context.project.id))
    end

    def show?
      # TODO: Only when you have access to the PC
      true
    end

    def update?
      user&.active? && (user.admin? || user.project_moderator?(record.participation_context.project.id))
    end

    def reorder?
      update?
    end

    def destroy?
      update?
    end
  end
end