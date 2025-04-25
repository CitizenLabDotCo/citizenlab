class AuthoringAssistanceResponsePolicy < ApplicationPolicy
  def create?
    user&.active? && user.super_admin?
  end
end
