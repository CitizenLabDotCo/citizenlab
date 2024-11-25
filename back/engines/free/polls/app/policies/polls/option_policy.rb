# frozen_string_literal: true

module Polls
  class OptionPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(question: scope_for(Question))
      end
    end

    def create?
      record&.question && policy_for(record.question).update?
    end

    def show?
      record&.question && policy_for(record.question).show?
    end

    def update?
      record&.question && policy_for(record.question).update?
    end

    def reorder?
      update?
    end

    def destroy?
      update?
    end
  end
end
