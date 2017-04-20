class VotePolicy < ApplicationPolicy
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
    user && record.user_id == user.id
    true
  end

  def show?
    true
  end

  def destroy?
    user && record.user_id == user.id
  end
end
