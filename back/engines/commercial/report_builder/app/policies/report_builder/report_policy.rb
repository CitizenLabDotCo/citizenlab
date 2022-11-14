# frozen_string_literal: true

module ReportBuilder
  class ReportPolicy < ::ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        raise Pundit::NotAuthorizedError unless user&.active? && user&.admin?

        @scope.all
      end
    end

    def allowed?
      admin? && active?
    end

    alias show? allowed?
    alias create? allowed?
    alias update? allowed?
    alias destroy? allowed?
  end
end
