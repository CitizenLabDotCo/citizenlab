module Polls
  class QuestionPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        projects = Pundit.policy_scope(user, Project)
        phases = Pundit.policy_scope(user, Phase)
        scope
          .where(participation_context: projects)
          .or(scope.where(participation_context: phases))
      end
    end

    def create?
      user&.active? && (user.admin? || user.project_moderator?(record.participation_context.project.id))
    end

    def show?
      ProjectPolicy.new(user, record.participation_context.project).show?
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
