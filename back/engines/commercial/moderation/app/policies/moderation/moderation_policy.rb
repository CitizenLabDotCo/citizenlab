module Moderation
  class ModerationPolicy < ApplicationPolicy
    class Scope
      attr_reader :user, :scope

      def initialize(user, scope)
        @user  = user
        @scope = scope
      end

      def resolve
        if user&.active? && user.admin?
          scope.all
        elsif user&.active?
          scope.where(project_id: ::UserRoleService.new.moderatable_projects(user))
        else
          scope.none
        end
      end
    end

    def update?
      user&.active? && ::UserRoleService.new.can_moderate?(record.source_record, user)
    end
  end
end