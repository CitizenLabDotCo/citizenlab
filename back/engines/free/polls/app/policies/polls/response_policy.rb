# frozen_string_literal: true

module Polls
  class ResponsePolicy < ApplicationPolicy
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
        scope.where(phase: moderatable_phases)
      end
    end

    def responses_count?
      active? && admin?
    end

    def index_xlsx?
      active? && admin?
    end

    def create?
      (
        active? &&
        (record.user_id == user.id) &&
        ProjectPolicy.new(user, record.phase.project).show? &&
        check_responding_allowed(record, user)
      )
    end

    private

    def check_responding_allowed(response, user)
      pcs = Permissions::BasePermissionsService.new
      !pcs.denied_reason_for_phase 'taking_poll', user, response.phase
    end
  end
end
