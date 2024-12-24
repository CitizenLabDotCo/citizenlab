# frozen_string_literal: true

class IdeaImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(idea: scope_for(Idea))
    end
  end

  def create?
    policy_for(record.idea).update?
  end

  def show?
    policy_for(record.idea).show?
  end

  def update?
    policy_for(record.idea).update?
  end

  def destroy?
    policy_for(record.idea).update?
  end
end
