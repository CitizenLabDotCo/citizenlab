# frozen_string_literal: true

class EventPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    attr_reader :attendee_id

    def initialize(user_context, scope, params)
      super(user_context, scope)
      @attendee_id = params[:attendee_id]
      # If we do not filter by project_ids, we hide events from unlisted projects
      @hide_events_unlisted_projects = !params[:project_ids].present?
    end

    def resolve
      project_scope = scope_for(Project)

      if @hide_events_unlisted_projects
        project_scope = ProjectPolicy.apply_listed_scope(
          project_scope,
          user,
          'remove_all_unlisted'
        )
      end

      result = scope.where(project: project_scope)

      # If the +attendee_id+ query parameter has been used to access the list of events
      # to which a user is registered, an additional set of permission rules is applied.
      attendee_id ? resolve_when_filtering_by_attendee(result) : result
    end

    private

    # This method assumes that the scope of events has already been filtered by
    # +attendee_id+ as this is the responsibility of the Finder class or its equivalent.
    def resolve_when_filtering_by_attendee(scope)
      raise Pundit::NotAuthorizedError unless user&.active?

      role_service = UserRoleService.new

      if user.admin? || user.id == @attendee_id
        scope.all
      elsif role_service.moderates_something?(user)
        # Moderators are allowed to view the list of events to which another user is
        # registered, but only for the projects they moderate.
        moderated_project = role_service.moderatable_projects(user)
        scope.where(project: moderated_project)
      else
        # Regular users are not allowed to view the list of events to which another
        # user is registered.
        raise Pundit::NotAuthorizedError
      end
    end
  end

  def create?
    policy_for(record.project).update?
  end

  def show?
    policy_for(record.project).show?
  end

  def update?
    policy_for(record.project).update?
  end

  def destroy?
    policy_for(record.project).update?
  end

  def attendees_xlsx?
    policy_for(record.project).update?
  end
end
