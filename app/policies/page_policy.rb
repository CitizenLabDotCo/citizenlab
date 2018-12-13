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
        scope.published
      end
    end
  end

  def create?
    user&.active? && user.admin?
  end

  def show?
    record.published? || (user&.active? && user.admin?)
  end

  def by_slug?
    show?
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    update?
  end
end
