# frozen_string_literal: true

class PhaseFilePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(phase_id: scope_for(Phase))
    end
  end

  def create?
    policy_for(record.phase).update?
  end

  def show?
    policy_for(record.phase).show?
  end

  def update?
    policy_for(record.phase).update?
  end

  def destroy?
    policy_for(record.phase).update?
  end
end
