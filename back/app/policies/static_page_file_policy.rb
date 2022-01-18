class StaticPageFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where static_page: Pundit.policy_scope(user, StaticPage)
    end
  end

  def create?
    StaticPagePolicy.new(user, record.static_page).update?
  end

  def show?
    StaticPagePolicy.new(user, record.static_page).show?
  end

  def update?
    StaticPagePolicy.new(user, record.static_page).update?
  end

  def destroy?
    StaticPagePolicy.new(user, record.static_page).update?
  end
end
