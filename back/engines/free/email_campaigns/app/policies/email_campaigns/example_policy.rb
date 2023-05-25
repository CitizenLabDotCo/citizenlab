# frozen_string_literal: true

module EmailCampaigns
  class ExamplePolicy < EmailCampaignsPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user&.admin?
          scope.all
        else
          scope.none
        end
      end
    end

    def index?
      user&.active? && user&.admin?
    end

    def show?
      user&.active? && user&.admin?
    end
  end
end
