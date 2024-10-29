# frozen_string_literal: true

class IdeaOfficialFeedbackPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.where(post: Pundit.policy_scope(user, Idea))
    end
  end

  def create?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def show?
    IdeaPolicy.new(user, record.post).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
