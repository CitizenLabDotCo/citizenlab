# frozen_string_literal: true

module PublicApi
  class PowerBiTemplatePolicy < ApplicationPolicy
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

    def show?
      active? && admin?
    end
  end
end
