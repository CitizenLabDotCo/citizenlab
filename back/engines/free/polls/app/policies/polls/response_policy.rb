module Polls
  class ResponsePolicy < ApplicationPolicy
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
        scope
          .where(participation_context: moderatable_projects)
          .or(scope.where(participation_context: moderatable_phases))
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
        ProjectPolicy.new(user, record.participation_context.project).show? &&
        check_responding_allowed(record, user)
      )
    end

    private

    def check_responding_allowed response, user
      pcs = ParticipationContextService.new
      !pcs.taking_poll_disabled_reason_for_context response.participation_context, user
    end
  end
end
