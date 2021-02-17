# frozen_string_literal: true

class TenantPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope.none
    end
  end

  def create?
    false
  end

  def show?
    false
  end

  def current?
    true
  end

  def update?
    user&.active? && user.admin?
  end

  def destroy?
    false
  end
end
