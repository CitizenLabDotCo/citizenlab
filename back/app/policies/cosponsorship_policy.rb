# frozen_string_literal: true

class CosponsorshipPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope.where(idea_id: Pundit.policy_scope(user, Idea))
    end
  end

  def accept?
    user.id == record.user_id
  end
end
