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
  end
end