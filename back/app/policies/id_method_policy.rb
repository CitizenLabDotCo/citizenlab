# frozen_string_literal: true

class IdMethodPolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    # scope is an array, not an AR scope
    def resolve
      scope
    end
  end

  def first_enabled_verification_method?
    true
  end

  def first_enabled_for_verified_actions?
    true
  end

  def first_enabled_authentication_method?
    true
  end
end
