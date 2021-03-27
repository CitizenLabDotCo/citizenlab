class SpamReportPolicy < ApplicationPolicy
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
    user&.active? && (record.user_id == user.id || user.admin?)
  end

  def show?
    user&.active? && (record.user_id == user.id || user.admin?)
  end

  def update?
    user&.active? && (record.user_id == user.id || user.admin?)
  end

  def destroy?
    update?
  end

end
