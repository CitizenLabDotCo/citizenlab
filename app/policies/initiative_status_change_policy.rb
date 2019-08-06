class InitiativeStatusChangePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      # Disabled
      scope.none
    end
  end

  def create? 
    user&.admin?
  end

  def show?
    # Disabled
    false
  end

end
