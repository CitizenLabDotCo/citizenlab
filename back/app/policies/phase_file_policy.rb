class PhaseFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      phase_ids = Pundit.policy_scope(user, Phase).ids
      scope.where(phase_id: phase_ids)
    end
  end

  def create?
    PhasePolicy.new(user, record.phase).update?
  end

  def show?
    PhasePolicy.new(user, record.phase).show?
  end

  def update?
    PhasePolicy.new(user, record.phase).update?
  end

  def destroy?
    PhasePolicy.new(user, record.phase).update?
  end

end
