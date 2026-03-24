module Moderators
  class SpaceModeratorPolicy < ApplicationPolicy
    def index?
      active_and_can_moderate?
    end

    def show?
      active_and_can_moderate?
    end

    def create?
      active_and_can_moderate?
    end

    def destroy?
      user&.active? && user.admin? # Only admins can remove space moderators
    end

    private

    def active_and_can_moderate?
      return false unless user&.active?

      user.admin? || UserRoleService.new.can_moderate?(record, user)
    end
  end
end
