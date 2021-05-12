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
      admin? && active?
    end

    def create?
      admin? && active?
    end

    def update?
      admin? && active?
    end

    def destroy?
      admin? && active?
    end
  end
end
