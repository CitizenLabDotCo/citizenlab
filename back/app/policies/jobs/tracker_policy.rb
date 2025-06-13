# frozen_string_literal: true

class Jobs::TrackerPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless active?

      # Currently restricts tracker access to admins and moderators only.
      # This policy should be expanded if trackers are used for other purposes
      # that require different access patterns (e.g., user-specific job tracking).
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
