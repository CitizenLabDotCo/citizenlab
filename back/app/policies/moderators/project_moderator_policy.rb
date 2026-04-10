module Moderators
  class ProjectModeratorPolicy < ApplicationPolicy
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
      return false unless role_higher_than_folder_moderator? # Currently, we don't allow PM to remove other PMs, but we should.

      active_and_can_moderate?
    end

    private

    def active_and_can_moderate?
      return false unless user&.active?

      UserRoleService.new.can_moderate?(record, user)
    end

    def role_higher_than_folder_moderator?
      user&.admin? || user&.project_folder_moderator? || user&.space_moderator?
    end
  end
end
