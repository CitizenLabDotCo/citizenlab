class InitiativeOfficialFeedbackPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(feedback_item: Pundit.policy_scope(user, Initiative))
    end
  end

  def create? 
    user&.admin?
  end

  def show?
    InitiativePolicy.new(user, record.feedback_item).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end

end
