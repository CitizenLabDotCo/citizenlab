class AttendancePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(event: Pundit.policy_scope(user, Event))
    end
  end

  def create?
    user&.active? && record.user_id == user.id
  end

  def show?
    EventPolicy.new(user, record.event).show?
  end

  def destroy?
    create?
  end
end
