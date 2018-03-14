class VotePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user && user.admin?
        scope
      elsif user
        scope.where(user: user)
      else
        scope.none
      end
    end
  end

  def create?
    (user&.active? && (record.user_id == user.id || user.admin?))
  end

  def show?
    (user&.active? && (record.user_id == user.id || user.admin?))
  end

  def up?
    user&.active?
  end

  def down?
    user&.active?
  end

  def destroy?
    show?
  end
end
