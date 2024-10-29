# frozen_string_literal: true

module Verification
  class VerificationMethodPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
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
