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
        is_admin = user&.admin? && user&.active?
        is_admin ? scope.all : scope.none
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
  end
end
