# frozen_string_literal: true

module ProjectManagement
  module Patches
    module StatIdeaPolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
      end

      module Scope
        def resolve_for_active
          super.or(resolve_for_project_moderator)
        end

        private

        def resolve_for_project_moderator
          return scope.none unless user.project_moderator?

          projects = ::UserRoleService.new.moderatable_projects user
          scope.where(project: projects)
        end
      end

      def show_stats_to_active?
        super || user.project_moderator?
      end
    end
  end
end
