# frozen_string_literal: true

class PermissionPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none if !user&.active?

      if user.admin?
        scope.all
      else
        moderating_phases = Phase.where(project_id: user.moderatable_project_ids)
        scope.where(permission_scope: moderating_phases)
      end
    end
  end

  def show?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def update?
    user&.active? && UserRoleService.new.can_moderate?(record, user)
  end

  def reset?
    update?
  end

  def requirements?
    true
  end

  def custom_fields?
    true
  end

  def custom_field_options?
    true
  end

  def access_denied_explanation?
    true
  end
end
