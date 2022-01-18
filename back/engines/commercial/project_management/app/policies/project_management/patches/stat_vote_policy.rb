# frozen_string_literal: true

module ProjectManagement
  module Patches
    module StatVotePolicy
      def self.prepended(base)
        base::Scope.prepend(Scope)
      end

      module Scope
        def resolve_for_active
          super.or(resolve_for_project_moderator)
        end

        def resolve_for_project_moderator
          return scope.none unless user.project_moderator?

          moderated_ideas = Idea.where(project_id: user.moderatable_project_ids)
          scope.where(votable: moderated_ideas)
        end
      end

      def show_stats_to_active?
        super || user.project_moderator?
      end
    end
  end
end
