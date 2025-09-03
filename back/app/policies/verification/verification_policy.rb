# frozen_string_literal: true

module Verification
  class VerificationPolicy < ApplicationPolicy
    class Scope < ApplicationPolicy::Scope
      def resolve
        scope.where(user: user)
      end
    end

    def create?
      # We don't check the usual user.active? because users who didn't
      # complete their registration yet should be able to verify as part of
      # the sign up flow
      user&.invite_not_pending? && record.user == user
    end
  end
end
