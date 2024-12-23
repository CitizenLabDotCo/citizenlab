# frozen_string_literal: true

class StatInitiativePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.active? && user&.admin?
        scope.all
      else
        scope.none
      end
    end
  end

  def initiatives_count?
    user&.active? && user&.admin?
  end
end
