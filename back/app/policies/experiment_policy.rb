# frozen_string_literal: true

class ExperimentPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
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
