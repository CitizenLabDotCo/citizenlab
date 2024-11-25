# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin? && user&.active?
        scope.management
      else
        scope.none
      end
    end
  end
end
