class PageFilePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      page_ids = Pundit.policy_scope(user, Page).ids
      scope.where(page_id: page_ids)
    end
  end

  def create?
    PagePolicy.new(user, record.page).update?
  end

  def show?
    PagePolicy.new(user, record.page).show?
  end

  def update?
    PagePolicy.new(user, record.page).update?
  end

  def destroy?
    PagePolicy.new(user, record.page).update?
  end

end
