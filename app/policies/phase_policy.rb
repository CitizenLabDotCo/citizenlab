class PhasePolicy < ApplicationPolicy
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
    user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end

  def show?
    true
  end

  def update?
    user&.active? && (user.admin? || user.project_moderator?(record.project_id))
  end

  def destroy?
    update?
  end

end
