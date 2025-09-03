# frozen_string_literal: true

class IdeasPhasePolicy < ApplicationPolicy
  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end

  def show?
    user.present? && UserRoleService.new.can_moderate_project?(record.phase.project, user)
  end
end
