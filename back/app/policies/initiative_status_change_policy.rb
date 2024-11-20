# frozen_string_literal: true

class InitiativeStatusChangePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      # Disabled
      if user&.active? && user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def create?
    user&.active? && user&.admin?
  end

  def show?
    user&.active? && user&.admin?
  end
end
