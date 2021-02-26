module Tagging
  class PendingTaskPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && (user&.admin? || user&.project_moderator?)
          scope.all
        else
          scope.none
        end
      end
    end
  end
end
