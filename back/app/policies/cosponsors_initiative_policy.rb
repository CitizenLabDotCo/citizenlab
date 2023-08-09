# frozen_string_literal: true

class CosponsorsInitiativePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def show?
    true
  end

  def accept_invite?
    true
  end
end
