# frozen_string_literal: true

class InitiativeImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(initiative: scope_for(Initiative))
    end
  end

  def create?
    policy_for(record.initiative).update?
  end

  def show?
    policy_for(record.initiative).show?
  end

  def update?
    policy_for(record.initiative).update?
  end

  def destroy?
    policy_for(record.initiative).update?
  end
end
