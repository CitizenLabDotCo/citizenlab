class VotePolicy < ApplicationPolicy
  # Business-related policies are covered
  # by the controller.

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
        scope.all
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
    (user&.active? && (record.user_id == user.id))
  end

  def up?
    (user&.active? && (record.user_id == user.id))
  end

  def down?
    (user&.active? && (record.user_id == user.id))
  end

  def destroy?
    (user&.active? && (record.user_id == user.id))
  end
end
