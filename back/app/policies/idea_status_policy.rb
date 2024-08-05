# frozen_string_literal: true

class IdeaStatusPolicy < ApplicationPolicy
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

  def create?
    user&.active? && user&.admin?
  end

  def update?
    create?
  end

  def reorder?
    update? && InputStatusService.new(record).can_reorder?
  end

  def destroy?
    update?
  end
end
