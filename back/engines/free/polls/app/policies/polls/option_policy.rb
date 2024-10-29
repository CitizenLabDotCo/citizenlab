# frozen_string_literal: true

module Polls
  class OptionPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(
          question: Pundit.policy_scope(user, Question)
        )
      end
    end

    def create?
      record&.question && Pundit.policy!(user, record.question).update?
    end

    def show?
      record&.question && Pundit.policy!(user, record.question).show?
    end

    def update?
      record&.question && Pundit.policy!(user, record.question).update?
    end

    def reorder?
      update?
    end

    def destroy?
      update?
    end
  end
end
