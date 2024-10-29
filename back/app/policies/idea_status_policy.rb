# frozen_string_literal: true

class IdeaStatusPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def show?
    true
  end

  def create?
    user&.active? && user&.admin?
  end

  def update?
    create?
  end

  def reorder?
    update?
  end

  def destroy?
    update?
  end
end
