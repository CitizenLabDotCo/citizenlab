# frozen_string_literal: true

class PhaseMethodPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(phase: scope_for(Phase))
    end
  end

  def index?
    show?
  end

  def show?
    policy_for(record.phase).show?
  end

  def create?
    policy_for(record.phase).update?
  end

  def destroy?
    policy_for(record.phase).update?
  end
end
