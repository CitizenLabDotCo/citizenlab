class AreaPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def create?
    user && user.admin?
  end

  def show?
    true
  end

  def update?
    user && user.admin?
  end

  def destroy?
    update?
  end
end
