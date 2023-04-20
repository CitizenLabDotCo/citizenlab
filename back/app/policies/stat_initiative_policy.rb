# frozen_string_literal: true

class StatInitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

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
