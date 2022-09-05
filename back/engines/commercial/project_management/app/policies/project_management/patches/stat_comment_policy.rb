# frozen_string_literal: true

module ProjectManagement
  module Patches
    module StatCommentPolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
      end

      module Scope
        def resolve_for_active
          super.or(resolve_for_project_moderator)
        end

        def resolve_for_project_moderator
          return scope.none unless user.project_moderator?

          projects = ::ProjectPolicy::Scope.new(user, ::Project.all).resolve
          # we're deliberately avoiding to join ideas to the main scope itself,
          # because it conflicts with other queries modifying the scope (e.g.
          # filtering on projects)
          scope.where(post_type: 'Idea', post_id: Idea.where(project: projects))
        end
      end

      def show_stats_to_active?
        super || user.project_moderator?
      end
    end
  end
end
