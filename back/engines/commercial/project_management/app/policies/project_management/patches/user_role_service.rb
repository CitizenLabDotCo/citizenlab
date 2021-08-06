# frozen_string_literal: true

module ProjectManagement
  module Patches
    module UserRoleService
      def can_moderate_project?(project, user)
        super || user.project_moderator?(project.id)
      end

      def moderators_for_project(project, scope = ::User)
        super.or scope.project_moderator(project.id)
      end

      # @param [User] user
      def moderatable_projects(user, scope = ::Project)
        return super unless user.project_moderator?

        super.or scope.where(id: user.moderatable_project_ids)
      end
    end
  end
end
