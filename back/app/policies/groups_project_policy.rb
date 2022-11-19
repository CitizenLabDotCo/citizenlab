# frozen_string_literal: true

class GroupsProjectPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      if user&.admin?
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

  def destroy?
    user&.active? && user&.admin?
  end
end
