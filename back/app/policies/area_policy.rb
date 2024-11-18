# frozen_string_literal: true

class AreaPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def create?
    user&.active? && user&.admin?
  end

  def show?
    true
  end

  def update?
    user&.active? && user&.admin?
  end

  def destroy?
    update?
  end

  def reorder?
    update?
  end

  def permitted_attributes_for_reorder
    [:ordering]
  end
end
