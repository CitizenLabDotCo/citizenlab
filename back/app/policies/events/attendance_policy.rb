# frozen_string_literal: true

class Events::AttendancePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      raise Pundit::NotAuthorizedError unless user&.active?

      role_service = UserRoleService.new
      raise Pundit::NotAuthorizedError unless role_service.moderates_something?(user)

      moderated_projects = role_service.moderatable_projects(user)
      scope.joins(:event).where(events: { project_id: moderated_projects })
    end
  end

  def create?
    return false unless active?
    return false unless user.id == record.attendee_id

    reason = Permissions::ProjectPermissionsService.new(
      record.event.project,
      user,
      fallback_to_last_phase: true
    ).denied_reason_for_action('attending_event')
    return false if reason

    policy_for(record.event.project).show?
  end

  def destroy?
    active? && (user.id == record.attendee_id || policy_for(record.event.project).update?)
  end
end
