class PagePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if @user && @user.admin?
        scope.all
      else
        scope.none
      end        
    end
  end

  def create?
    user && user.admin?
  end

  def by_slug?
    true
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
