# frozen_string_literal: true

module Polls
  class ResponsePolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
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
      active? &&
        (record.user_id == user.id) &&
        policy_for(record.phase.project).show? &&
        check_responding_allowed(record, user)
    end

    private

    def check_responding_allowed(response, user)
      !Permissions::PhasePermissionsService.new(response.phase, user).denied_reason_for_action 'taking_poll'
    end
  end
end
