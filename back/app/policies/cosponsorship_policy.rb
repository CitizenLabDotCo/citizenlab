# frozen_string_literal: true

class CosponsorshipPolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end
    
    def resolve
      scope.all
    end

    def accept_cosponsorship?
      user.id == record.user_id
    end
  end
end