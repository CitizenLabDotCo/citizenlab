# frozen_string_literal: true

class ExperimentPolicy < ApplicationPolicy
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

  def index?
    user&.active? && user&.admin?
  end

  def create?
    true
  end
end