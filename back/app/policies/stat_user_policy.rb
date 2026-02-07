# frozen_string_literal: true

class StatUserPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user&.active?

      resolve_for_active
    end

    private

    def resolve_for_active
      user.admin? ? scope.all : resolve_for_project_moderator
    end

    def resolve_for_project_moderator
      return scope.none unless user.project_moderator?

      ::UserRoleService.new.moderatable_projects(user)
        .map { |project| ::ProjectPolicy::InverseScope.new(project, scope).resolve }
        .reduce(:or)
    end
  end

  def users_count?
    return false unless active?

    admin? || user.project_moderator?
  end
end
