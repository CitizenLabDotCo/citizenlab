class AppConfigurationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.none
    end
  end

  def show?
    true
  end

  def update?
    user&.active? && user.admin?
  end

  def create?; false end
  def destroy?; false end
end
