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
    user&.active? && user.admin?
  end

  def show?
    true
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    update?
  end

  def reorder?
    update?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
