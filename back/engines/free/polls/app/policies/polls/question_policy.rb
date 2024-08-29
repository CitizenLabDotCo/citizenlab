# frozen_string_literal: true

module Polls
  class QuestionPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        phases = Pundit.policy_scope(user, Phase)
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
