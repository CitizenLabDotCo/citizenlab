# frozen_string_literal: true

module Volunteering
  class VolunteerPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        return scope.none unless user

        moderatable_projects = ::UserRoleService.new.moderatable_projects user
        moderatable_phases = Phase.where(project: moderatable_projects)
        joined_scope = scope.joins(:cause)
        joined_scope.where(volunteering_causes: { phase_id: moderatable_phases })
      end
    end

    def index_xlsx?
      user&.active? && (user&.admin? || user&.project_moderator?)
    end

    def create?
      return false unless user&.active?
      return false unless record.user_id == user.id

      project = record.cause.phase.project
      service = Permissions::ProjectPermissionsService.new(project, user)
      reason = service.denied_reason_for_action('volunteering')
      return false if reason

      policy_for(record.cause.phase.project).show?
    end

    def destroy?
      create?
    end
  end
end
