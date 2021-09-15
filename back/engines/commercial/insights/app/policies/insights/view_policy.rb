# frozen_string_literal: true

module Insights
  class ViewPolicy < ::ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        raise Pundit::NotAuthorizedError unless user&.admin? && user&.active?

        scope.all
      end
    end
    
    def show?
      user.active_admin_or_moderator?(record.scope)
    end

    def create?
      user.active_admin_or_moderator?(record.scope)
    end

    def update?
      user.active_admin_or_moderator?(record.scope)
    end

    def destroy?
      user.active_admin_or_moderator?(record.scope)
    end
  end
end
