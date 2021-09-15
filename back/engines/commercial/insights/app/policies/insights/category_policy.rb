# frozen_string_literal: true

module Insights
  class CategoryPolicy < ::ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user = user
        @scope = scope
      end

      def resolve
        scope.where(view: Pundit.policy_scope!(user, View))
      end
    end

    delegate :show?, :create?, :update?, :destroy?, to: :view_policy

    def destroy_all?
      # If you can destroy the whole view, you can destroy all categories.
      view_policy.destroy?
    end

    private

    def view_policy
      @view_policy ||= Pundit.policy!(user, record.view)
    end
  end
end
