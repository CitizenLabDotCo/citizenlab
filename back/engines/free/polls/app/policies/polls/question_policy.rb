# frozen_string_literal: true

module Polls
  class QuestionPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(phase: scope_for(Phase))
      end
    end

    def create?
      can_moderate?(record.phase.project)
    end

    def show?
      policy_for(record.phase.project).show?
    end

    def update?
      can_moderate?(record.phase.project)
    end

    def reorder?
      update?
    end

    def destroy?
      update?
    end
  end
end
