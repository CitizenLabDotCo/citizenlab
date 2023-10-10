# frozen_string_literal: true

module Volunteering
  class VolunteerPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        return scope.none unless user

        moderatable_projects = ::UserRoleService.new.moderatable_projects user
        moderatable_phases = Phase.where(project: moderatable_projects)
        joined_scope = scope.joins(:cause)
        joined_scope
          .where(volunteering_causes: { participation_context_id: moderatable_projects })
          .or(joined_scope.where(volunteering_causes: { participation_context_id: moderatable_phases }))
      end
    end

    def index_xlsx?
      # TODO: also allow folder moderators
      user&.active? && (user&.admin? || user&.project_moderator?)
    end

    def create?
      return false if !user&.active?
      return false if record.user_id != user.id

      project = record.cause.participation_context.project
      return false if !ProjectPolicy.new(user, project).show?

      reason = ParticipationContextService.new.volunteering_disabled_reason_for_project project, user
      raise_not_authorized reason if reason
      true
    end

    def destroy?
      create?
    end
  end
end
