module Verification
  class IdCardPolicy < ApplicationPolicy
  
    def bulk_replace?
      user&.active? && user.admin?
    end

    def count?
      user&.active? && user.admin?
    end
  end
end