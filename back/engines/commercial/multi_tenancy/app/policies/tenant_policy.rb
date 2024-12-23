# frozen_string_literal: true

class TenantPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
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
    user&.active? && user&.admin?
  end

  def destroy?
    false
  end
end
