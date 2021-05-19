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

    private

    def view_policy
      # We retrieve the policy using `View` instead of: `Pundit.policy!(user, record.view)`
      # to avoid an extra DB query? We can do it because the view policy rules does not
      # depend on the view, only on the user.
      @view_policy ||= Pundit.policy!(user, View)
    end
  end
end
