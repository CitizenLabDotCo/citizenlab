# frozen_string_literal: true

class AppConfigurationPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.none
    end
  end

  def show?
    true
  end

  def update?
    user&.active? && user&.admin?
  end

  def create?
    false
  end

  def destroy?
    false
  end
end
