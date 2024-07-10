# frozen_string_literal: true

class PermissionsFieldPolicy < ApplicationPolicy
  def index?
    moderate?
  end

  def show?
    moderate?
  end

  def create?
    moderate?
  end

  def update?
    moderate?
  end

  def reorder?
    moderate?
  end

  def destroy?
    moderate?
  end

  private

  def moderate?
    user&.active? && UserRoleService.new.can_moderate?(record.permission, user)
  end
end
