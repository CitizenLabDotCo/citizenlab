# frozen_string_literal: true
class OfficialFeedbackPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(idea: scope_for(Idea))
    end
  end

  def create?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def show?
    policy_for(record.idea).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
