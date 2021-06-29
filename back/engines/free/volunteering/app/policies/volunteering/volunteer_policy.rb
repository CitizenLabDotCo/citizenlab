module Volunteering
  class VolunteerPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        return scope.none if !user
        moderatable_projects = ::UserRoleService.new.moderatable_projects user
        moderatable_phases = Phase.where(project: moderatable_projects)
        joined_scope = scope.joins(:cause)
        joined_scope
          .where(volunteering_causes: {participation_context_id: moderatable_projects})
          .or(joined_scope.where(volunteering_causes: {participation_context_id: moderatable_phases}))
      end
    end

    def index_xlsx?
      # TODO also allow folder moderators
      user&.active? && (user.admin? || user.project_moderator?)
    end

    def create?
      user&.active? && 
      (record.user_id == user.id) &&
      ProjectPolicy.new(user, record.cause.participation_context.project).show?
    end

    def destroy?
      create?
    end
  end
end