# frozen_string_literal: true

class Jobs::TrackerPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless active?

      if admin?
        scope.all
      else
        moderated_projects = ::UserRoleService.new.moderatable_projects(user)
        scope.where(project: moderated_projects)
      end
    end
  end

  def show?
    active? && UserRoleService.new.can_moderate?(record.project, user)
  end
end
