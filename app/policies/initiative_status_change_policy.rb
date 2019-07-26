class InitiativeStatusChangePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope
    end
  end

  def create? 
    user&.admin?
  end

  def show?
    true
  end

end
