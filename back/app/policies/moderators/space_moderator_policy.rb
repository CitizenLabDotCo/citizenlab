module Moderators
  class SpaceModeratorPolicy < ApplicationPolicy
    def index?
      active_and_can_moderate?
    end

    def show?
      active_and_can_moderate?
    end

    def create?
      active_admin?
    end

    def destroy?
      active_admin? # Only admins can remove space moderators
    end

    private

    def active_and_can_moderate?
      return false unless user&.active?

      UserRoleService.new.can_moderate?(record, user)
    end
  end
end
