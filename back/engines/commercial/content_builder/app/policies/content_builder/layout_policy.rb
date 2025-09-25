# frozen_string_literal: true

module ContentBuilder
  class LayoutPolicy < ApplicationPolicy
    def show?
      true
    end

    def upsert?
      moderator?
    end

    def update?
      moderator?
    end

    def destroy?
      moderator?
    end

    private

    def moderator?
      user&.active? && (record.content_buildable ? user_role_service.can_moderate?(record.content_buildable, user) : user.admin?)
    end

    def user_role_service
      @user_role_service ||= UserRoleService.new
    end
  end
end
