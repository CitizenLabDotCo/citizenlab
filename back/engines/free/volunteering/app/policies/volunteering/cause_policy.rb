# frozen_string_literal: true

module Volunteering
  class CausePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        phases = Pundit.policy_scope(user_context, Phase)
        scope.where(phase: phases)
      end
    end

    def create?
      user&.active? && (user&.admin? || user&.project_moderator?(record.phase.project.id))
    end

    def show?
      ProjectPolicy.new(user, record.phase.project).show?
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
