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
        joined_scope.where(volunteering_causes: { phase_id: moderatable_phases })
      end
    end

    def index_xlsx?
      user&.active? && (user&.admin? || moderator_of_project?(record))
    end

    def create?
      user&.active? &&
        (record.user_id == user.id) &&
        ProjectPolicy.new(user, record.cause.phase.project).show?
    end

    def destroy?
      create?
    end

    private

    def moderator_of_project?(record)
      user&.project_moderator? && ProjectPolicy.new(user, record.cause.phase.project).update?
    end
  end
end
