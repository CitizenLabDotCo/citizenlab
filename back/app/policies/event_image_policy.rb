# frozen_string_literal: true

class EventImagePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(event: scope_for(Event))
    end
  end

  def create?
    policy_for(record.event).update?
  end

  def show?
    policy_for(record.event).show?
  end

  def update?
    policy_for(record.event).update?
  end

  def destroy?
    policy_for(record.event).update?
  end
end
