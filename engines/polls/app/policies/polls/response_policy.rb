module Polls
  class ResponsePolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        # TODO: Only when admin or for those you're a moderator
        scope.none
      end
    end

    def create?
      # TODO: Only if you have the permission to answer
      user&.active?
    end

  end
end