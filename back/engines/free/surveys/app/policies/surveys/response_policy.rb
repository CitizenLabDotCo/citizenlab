module Surveys
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
          .where(participation_context: moderatable_projects + moderatable_phases)
      end
    end

    def index_xlsx?
      user&.active? && user.admin?
    end


  end
end