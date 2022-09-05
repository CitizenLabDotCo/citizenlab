# frozen_string_literal: true

module ProjectManagement
  module Patches
    module UserRoleService
      def can_moderate_project?(project, user)
        super || (project.persisted? && user.project_moderator?(project.id))
      end

      def moderators_for_project(project, scope = ::User)
        if project.id
          super.or scope.project_moderator(project.id)
        else
          super
        end
      end

      def moderatable_projects(user, scope = ::Project)
        return super unless user.project_moderator?

        super.or scope.where(id: user.moderatable_project_ids)
      end

      def moderates_something?(user)
        super || user.project_moderator?
      end
    end
  end
end
