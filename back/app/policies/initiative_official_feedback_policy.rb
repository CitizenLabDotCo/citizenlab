# frozen_string_literal: true

class InitiativeOfficialFeedbackPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(post: Pundit.policy_scope(user, Initiative))
    end
  end

  def create?
    user&.admin?
  end

  def show?
    InitiativePolicy.new(user, record.post).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
