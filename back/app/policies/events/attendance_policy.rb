# frozen_string_literal: true

class Events::AttendancePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

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

    reason = Permissions::ProjectPermissionsService.new(record.event.project, user).denied_reason_for_action 'attending_event'
    return false if reason

    ProjectPolicy.new(user, record.event.project).show?
  end

  def destroy?
    active? && (
      user.id == record.attendee_id ||
      ProjectPolicy.new(user, record.event.project).update?
    )
  end
end
