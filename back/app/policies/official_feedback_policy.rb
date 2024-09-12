# frozen_string_literal: true

class OfficialFeedbackPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.where(idea: Pundit.policy_scope(user, Idea))
    end
  end

  def create?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def show?
    IdeaPolicy.new(user, record.idea).show?
  end

  def update?
    create?
  end

  def destroy?
    create?
  end
end
