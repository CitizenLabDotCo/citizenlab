# frozen_string_literal: true

module Polls
  class QuestionPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(phase: scope_for(Phase))
      end
    end

    def create?
      user&.active? && (user&.admin? || user&.project_moderator?(record.phase.project.id))
    end

    def show?
      policy_for(record.phase.project).show?
    end

    def update?
      user&.active? && (user&.admin? || user&.project_moderator?(record.phase.project.id))
    end

    def reorder?
      update?
    end

    def destroy?
      update?
    end
  end
end
