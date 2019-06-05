class InitiativeFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(initiative: Pundit.policy_scope(user, Initiative))
    end
  end

  def create?
    InitiativePolicy.new(user, record.initiative).update?
  end

  def show?
    InitiativePolicy.new(user, record.initiative).show?
  end

  def update?
    InitiativePolicy.new(user, record.initiative).update?
  end

  def destroy?
    InitiativePolicy.new(user, record.initiative).update?
  end

end
