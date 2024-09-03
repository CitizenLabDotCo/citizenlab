# frozen_string_literal: true

module Verification
  class VerificationMethodPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      # scope is an array, not an AR scope
      def resolve
        scope
      end
    end

    def first_enabled?
      true
    end

    def first_enabled_for_verified_actions?
      true
    end
  end
end
