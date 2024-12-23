# frozen_string_literal: true

class InitiativeOfficialFeedbackPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(post: scope_for(Initiative))
    end
  end

  def create?
    user&.admin?
  end

  def show?
    policy_for(record.post).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
