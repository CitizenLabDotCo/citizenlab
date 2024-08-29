# frozen_string_literal: true

class IdeasPhasePolicy < ApplicationPolicy
  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user  = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end

  def show?
    user.present? && UserRoleService.new.can_moderate_project?(record.phase.project, user)
  end
end
