# frozen_string_literal: true

class ActivityPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin? && user&.active?
        scope.management
      else
        scope.none
      end
    end
  end
end
