class InvitationCodeActivationPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end
  end

  def create?
    user && (record.id == user.id || user.admin?)
  end

end